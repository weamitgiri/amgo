import { query } from '../config/db';

/**
 * Stale-data protection for REUSED game_group ids.
 *
 * Nothing references game_groups with a foreign key, so when a group row disappears
 * (a test DB reset / dump re-import, a manual delete) its timers, questions, etc.
 * stay behind — and MySQL can later hand the SAME id to a brand-new group. That new
 * group then "inherits" the old rows. The visible symptom: ensureCaseSummaryTimer
 * finds the old (inactive) case_summary timer, assumes the clock already started and
 * never creates a new one, so a fresh game opens straight on Investigation with
 * 00:00 on the clock — and only for groups whose id happened to be used before
 * ("sometimes works, sometimes not").
 */

// Everything scoped to a group, children first so each delete can still resolve its
// parent (answers → questions, cc_* → cc_game_instances, score_logs → sessions).
const CC_CHILD_TABLES = [
    'cc_round1_votes',
    'cc_round1_selected_ingredients',
    'cc_round2_steps',
    'cc_round2_step_votes',
    'cc_round2_released_clues',
    'cc_round3_messages',
    'cc_round3_impostor_votes',
    'cc_ratings',
];

const GROUP_SCOPED_DELETES: string[] = [
    'DELETE FROM score_logs WHERE participant_session_id IN (SELECT id FROM participant_sessions WHERE group_id = ?)',
    'DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE group_id = ?)',
    'DELETE FROM questions WHERE group_id = ?',
    'DELETE FROM votes WHERE group_id = ?',
    'DELETE FROM lie_detector_rounds WHERE group_id = ?',
    'DELETE FROM group_accusations WHERE group_id = ?',
    'DELETE FROM witness_passcards WHERE group_id = ?',
    'DELETE FROM clue_rooms WHERE group_id = ?',
    'DELETE FROM timers WHERE group_id = ?',
    'DELETE FROM results WHERE group_id = ?',
    'DELETE FROM participant_sessions WHERE group_id = ?',
    ...CC_CHILD_TABLES.map(
        (t) => `DELETE FROM ${t} WHERE instance_id IN (SELECT id FROM cc_game_instances WHERE group_id = ?)`
    ),
    'DELETE FROM cc_game_instances WHERE group_id = ?',
    // People are kept, just detached from the dead group so they don't show up in
    // (and take slots of) the new group's lobby.
    'UPDATE game_participants SET group_id = NULL WHERE group_id = ?',
];

/**
 * Call right after INSERTing a new game_groups row, inside the same transaction.
 * The group is brand new, so ANY row already carrying its id is left over from a
 * previous group that had the same id — none of it belongs to this game.
 */
export async function clearStaleDataForNewGroup(conn: any, groupId: number | string): Promise<void> {
    for (const sql of GROUP_SCOPED_DELETES) {
        try {
            await conn.query(sql, [groupId]);
        } catch (err: any) {
            // A table that doesn't exist on this install (e.g. no Cook & Create) is fine.
            if (err?.code !== 'ER_NO_SUCH_TABLE') throw err;
        }
    }
}

/**
 * Boot-time sweep: remove group-scoped rows that can't belong to their group —
 * either the group no longer exists (orphan), or the row was created before the
 * group was (it belongs to an earlier group that had the same id). Runs on every
 * API start, so existing bad data is cleaned on deploy without any manual SQL.
 */
export async function purgeStaleGroupRowsOnBoot(): Promise<void> {
    // Tables with their own group_id + created_at.
    const tables = [
        'timers',
        'questions',
        'votes',
        'lie_detector_rounds',
        'group_accusations',
        'witness_passcards',
        'clue_rooms',
        'results',
        'participant_sessions',
    ];
    let removed = 0;
    for (const t of tables) {
        try {
            if (t === 'questions') {
                const [a] = await query<any>(
                    `DELETE a FROM answers a JOIN questions q ON q.id = a.question_id
                       LEFT JOIN game_groups g ON g.id = q.group_id
                      WHERE g.id IS NULL OR q.created_at < g.created_at`
                );
                removed += Number((a as any)?.affectedRows || 0);
            }
            if (t === 'participant_sessions') {
                const [s] = await query<any>(
                    `DELETE sl FROM score_logs sl JOIN participant_sessions x ON x.id = sl.participant_session_id
                       LEFT JOIN game_groups g ON g.id = x.group_id
                      WHERE g.id IS NULL OR x.created_at < g.created_at`
                );
                removed += Number((s as any)?.affectedRows || 0);
            }
            const [r] = await query<any>(
                `DELETE x FROM ${t} x LEFT JOIN game_groups g ON g.id = x.group_id
                  WHERE g.id IS NULL OR x.created_at < g.created_at`
            );
            removed += Number((r as any)?.affectedRows || 0);
        } catch (err: any) {
            if (err?.code !== 'ER_NO_SUCH_TABLE' && err?.code !== 'ER_BAD_FIELD_ERROR') {
                console.warn(`[groupDataCleanup] Could not purge stale ${t}:`, err.message || err);
            }
        }
    }
    // Cook & Create instances (children first).
    try {
        const staleInst = `SELECT x.id FROM cc_game_instances x LEFT JOIN game_groups g ON g.id = x.group_id
                            WHERE g.id IS NULL OR x.created_at < g.created_at`;
        for (const t of CC_CHILD_TABLES) {
            const [r] = await query<any>(`DELETE FROM ${t} WHERE instance_id IN (SELECT id FROM (${staleInst}) s)`);
            removed += Number((r as any)?.affectedRows || 0);
        }
        const [r] = await query<any>(`DELETE FROM cc_game_instances WHERE id IN (SELECT id FROM (${staleInst}) s)`);
        removed += Number((r as any)?.affectedRows || 0);
    } catch (err: any) {
        if (err?.code !== 'ER_NO_SUCH_TABLE') console.warn('[groupDataCleanup] Could not purge stale cc instances:', err.message || err);
    }

    // People: detach anyone pointing at a group that's gone, or at a group from a
    // DIFFERENT booking (their old group's id was reused) — otherwise they'd appear in,
    // and take slots of, the new group's lobby. The person record itself is kept.
    try {
        const [r] = await query<any>(
            `UPDATE game_participants x LEFT JOIN game_groups g ON g.id = x.group_id
                SET x.group_id = NULL
              WHERE x.group_id IS NOT NULL AND (g.id IS NULL OR g.booking_id <> x.booking_id)`
        );
        removed += Number((r as any)?.affectedRows || 0);
    } catch (err: any) {
        console.warn('[groupDataCleanup] Could not detach stale participants:', err.message || err);
    }

    if (removed > 0) console.log(`[groupDataCleanup] Removed ${removed} stale row(s) left over from reused group ids`);
}
