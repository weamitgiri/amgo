import { query, withTransaction } from '../config/db';
import moment from 'moment';
import { io } from '../server';

export type CCIngredient = {
    id: number;
    name: string;
    image_url: string | null;
    is_absurd: boolean;
};

export type CCGameTemplate = {
    id: number;
    activity_game_id: number;
    name: string;
    tagline: string | null;
    description: string | null;
    background_image: string | null;
    chef1_image: string | null;
    chef2_image: string | null;
    chef3_image: string | null;
    chef4_image: string | null;
    show_host_image: string | null;
    round1_ingredients_count: number;
    round1_votes_per_player: number;
    round1_top_ingredients: number;
    round1_timer_secs: number;
    round2_step_max_chars: number;
    round2_submit_timer_secs: number;
    round2_review_timer_secs: number;
    round3_discussion_timer_secs: number;
    round3_voting_timer_secs: number;
    round3_max_messages_per_player: number;
    show_host_role_enabled: boolean;
    impostor_bias_card_text: string | null;
};

export type CCGameInstance = {
    id: number;
    group_id: number;
    template_id: number;
    status: 'waiting' | 'round1' | 'round2' | 'round3_discussion' | 'round3_voting' | 'completed';
    impostor_participant_id: number | null;
    show_host_participant_id: number | null;
    dish_name: string | null;
    dish_named_by_participant_id: number | null;
    round1_started_at: string | null;
    round2_started_at: string | null;
    round3_discussion_started_at: string | null;
    round3_voting_started_at: string | null;
    finished_at: string | null;
    group_won: boolean | null;
    round2_phase: 'submit' | 'review';
    /** 0-based position in the group's join order whose Round-2 turn it is; null before Round 2. */
    round2_turn_index: number | null;
    round2_turn_started_at: string | null;
    /** When the review sub-phase opened — anchors the review countdown. */
    round2_review_started_at: string | null;
    double_down_participant_id: number | null;
    double_down_status: 'offered' | 'accepted' | 'declined' | null;
};

/**
 * Get the ingredient pool for a specific template — via cc_game_template_ingredients,
 * not cc_ingredients.activity_id. The admin Template form already lets an admin pick
 * which ingredients belong to a template (so different games CAN have different
 * ingredient sets); this makes gameplay actually respect that pick instead of
 * ignoring it. (Previously filtered by activity_id, which was hardcoded to a single
 * orphaned default activity on cc_ingredients and returned zero rows for every real
 * Cook & Create booking — see git history for the incident.)
 */
export async function getCCIngredients(templateId: number | string): Promise<CCIngredient[]> {
    const [rows] = await query(
        `SELECT i.id, i.name, i.image_url, i.is_absurd
         FROM cc_game_template_ingredients ti
         JOIN cc_ingredients i ON i.id = ti.ingredient_id
         WHERE ti.template_id = ? AND i.status = 'active'
         ORDER BY ti.\`order\` ASC`,
        [templateId]
    );
    return rows.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        image_url: r.image_url,
        is_absurd: Boolean(r.is_absurd),
    }));
}

function mapTemplateRow(r: any): CCGameTemplate {
    return {
        id: Number(r.id),
        activity_game_id: Number(r.activity_game_id),
        name: r.name,
        tagline: r.tagline,
        description: r.description,
        background_image: r.background_image ?? null,
        chef1_image: r.chef1_image ?? null,
        chef2_image: r.chef2_image ?? null,
        chef3_image: r.chef3_image ?? null,
        chef4_image: r.chef4_image ?? null,
        show_host_image: r.show_host_image ?? null,
        round1_ingredients_count: Number(r.round1_ingredients_count),
        round1_votes_per_player: Number(r.round1_votes_per_player),
        round1_top_ingredients: Number(r.round1_top_ingredients),
        round1_timer_secs: Number(r.round1_timer_secs),
        round2_step_max_chars: Number(r.round2_step_max_chars),
        round2_submit_timer_secs: Number(r.round2_submit_timer_secs),
        round2_review_timer_secs: Number(r.round2_review_timer_secs),
        round3_discussion_timer_secs: Number(r.round3_discussion_timer_secs),
        round3_voting_timer_secs: Number(r.round3_voting_timer_secs),
        round3_max_messages_per_player: Number(r.round3_max_messages_per_player),
        show_host_role_enabled: Boolean(r.show_host_role_enabled),
        impostor_bias_card_text: r.impostor_bias_card_text,
    };
}

/**
 * Get template by activity_game_id
 */
export async function getCCTemplateByGameId(activityGameId: number | string): Promise<CCGameTemplate | null> {
    const [rows] = await query(
        `SELECT * FROM cc_game_templates WHERE activity_game_id = ? AND status = 'active' LIMIT 1`,
        [activityGameId]
    );
    if (rows.length === 0) return null;
    return mapTemplateRow(rows[0]);
}

/**
 * Get template by its own id (any status — used by admin/instance lookups).
 */
export async function getCCTemplateById(templateId: number | string): Promise<CCGameTemplate | null> {
    const [rows] = await query(`SELECT * FROM cc_game_templates WHERE id = ? LIMIT 1`, [templateId]);
    if (rows.length === 0) return null;
    return mapTemplateRow(rows[0]);
}

function mapInstanceRow(r: any): CCGameInstance {
    return {
        id: Number(r.id),
        group_id: Number(r.group_id),
        template_id: Number(r.template_id),
        status: r.status,
        impostor_participant_id: r.impostor_participant_id ? Number(r.impostor_participant_id) : null,
        show_host_participant_id: r.show_host_participant_id ? Number(r.show_host_participant_id) : null,
        dish_name: r.dish_name,
        dish_named_by_participant_id: r.dish_named_by_participant_id ? Number(r.dish_named_by_participant_id) : null,
        round1_started_at: r.round1_started_at,
        round2_started_at: r.round2_started_at,
        round3_discussion_started_at: r.round3_discussion_started_at,
        round3_voting_started_at: r.round3_voting_started_at,
        finished_at: r.finished_at,
        group_won: r.group_won == null ? null : Boolean(r.group_won),
        round2_phase: r.round2_phase || 'submit',
        round2_turn_index: r.round2_turn_index == null ? null : Number(r.round2_turn_index),
        round2_turn_started_at: r.round2_turn_started_at ?? null,
        round2_review_started_at: r.round2_review_started_at ?? null,
        double_down_participant_id: r.double_down_participant_id ? Number(r.double_down_participant_id) : null,
        double_down_status: r.double_down_status ?? null,
    };
}

/**
 * Get a CC instance (+ its template) by instance id. Used by the round-completion
 * checks and timer-expiry handlers, which only have instance_id/group_id on hand.
 */
export async function getInstanceById(instanceId: number | string): Promise<{ instance: CCGameInstance; template: CCGameTemplate } | null> {
    const [rows] = await query<any>(`SELECT * FROM cc_game_instances WHERE id = ? LIMIT 1`, [instanceId]);
    if (rows.length === 0) return null;
    const instance = mapInstanceRow(rows[0]);
    const template = await getCCTemplateById(instance.template_id);
    if (!template) return null;
    return { instance, template };
}

/**
 * Count of participants currently in a group. Mirrors the same "whole roster,
 * no left_at filtering" simplicity Mystery's own accusation-completion check
 * uses (verdictScoringService.submitAccusation) — a departed player still
 * counts toward "everyone", so the game only auto-advances via the timer if
 * they never come back, same as Mystery.
 */
async function getGroupParticipantIds(groupId: number | string): Promise<number[]> {
    const [rows] = await query<any>('SELECT id FROM game_participants WHERE group_id = ?', [groupId]);
    return (rows || []).map((r: any) => Number(r.id));
}

const CC_TIMER_TYPES = [
    'cc_round1',
    'cc_round2_submit',
    'cc_round2_turn',
    'cc_round2_review',
    'cc_round3_discussion',
    'cc_round3_voting',
];

/**
 * The Round-2 turn order, as persisted on the instance when Round 2 opened.
 *
 * CRITICAL: this is a SHUFFLE, not the participant display order, and it is
 * never sent to any client. A step's letter comes from its author's turn
 * position, so if turn order matched the order players are listed in, everyone
 * could map "Step C" to the third name in the sidebar — handing them the
 * impostor during review and breaking the game's documented anonymity rule
 * ("Steps appear on screen with no names — just Step A, B, C, D, E").
 *
 * Falls back to join order only for instances that predate this column, which
 * can only be ones already past Round 2.
 */
async function getRound2TurnOrder(instanceId: number | string, groupId: number | string): Promise<number[]> {
    const [rows] = await query<any>('SELECT round2_turn_order FROM cc_game_instances WHERE id = ? LIMIT 1', [
        instanceId,
    ]);
    const raw = rows?.[0]?.round2_turn_order;
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed.map((v: any) => Number(v));
        } catch {
            /* fall through to join order */
        }
    }
    const [fallback] = await query<any>(
        `SELECT id FROM game_participants WHERE group_id = ?
         ORDER BY COALESCE(email_verified_at, created_at) ASC, id ASC`,
        [groupId]
    );
    return (fallback || []).map((r: any) => Number(r.id));
}

/**
 * Shuffles and persists the turn order for this instance. Called once, when
 * Round 1 finalizes — idempotent via the NULL guard so a re-entrant
 * finalizeRound1 can't reshuffle a round already in progress.
 */
async function assignRound2TurnOrder(instanceId: number | string, groupId: number | string): Promise<void> {
    const [rows] = await query<any>(
        `SELECT id FROM game_participants WHERE group_id = ?
         ORDER BY COALESCE(email_verified_at, created_at) ASC, id ASC`,
        [groupId]
    );
    const ids = (rows || []).map((r: any) => Number(r.id));
    for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    await query('UPDATE cc_game_instances SET round2_turn_order = ? WHERE id = ? AND round2_turn_order IS NULL', [
        JSON.stringify(ids),
        instanceId,
    ]);
}

/** Turn 0 -> 'A', turn 1 -> 'B', ... Group size is capped well under 26. */
export function round2StepLetter(turnIndex: number): string {
    return String.fromCharCode(65 + turnIndex);
}

/**
 * Back-fills round2_review_started_at for a round that entered review before
 * that column existed, which would otherwise render its countdown as 00:00.
 *
 * Derived from the review timer that is actually running (expiry minus the
 * configured review length) rather than simply stamping "now", so the clock the
 * players see matches the moment the server will really close the phase.
 */
export async function ensureRound2ReviewStartedAt(
    instanceId: number | string,
    groupId: number | string
): Promise<void> {
    const data = await getInstanceById(instanceId);
    if (!data) return;
    const { instance, template } = data;
    if (instance.status !== 'round2' || instance.round2_phase !== 'review') return;
    if (instance.round2_review_started_at) return;

    const [timerRows] = await query<any>(
        `SELECT expires_at FROM timers
         WHERE group_id = ? AND timer_type = 'cc_round2_review' AND is_active = 1
         ORDER BY id DESC LIMIT 1`,
        [groupId]
    );
    const expiresAt = timerRows?.[0]?.expires_at;
    // Only back-fill when there is a live timer to align to. With no active
    // timer the phase's clock has already run out, and inventing a fresh window
    // here (e.g. stamping NOW()) would show players a countdown that the server
    // has no intention of honouring. Left NULL, the client falls back to the
    // round's start and correctly renders 00:00.
    if (!expiresAt) return;

    await query(
        `UPDATE cc_game_instances
         SET round2_review_started_at = DATE_SUB(?, INTERVAL ? SECOND)
         WHERE id = ? AND round2_review_started_at IS NULL`,
        [expiresAt, template.round2_review_timer_secs, instanceId]
    );
}

/**
 * Repairs a Round-2 instance that has no turn state.
 *
 * Any game that was already mid-Round-2 when turn-based submission shipped has
 * round2_turn_index / round2_turn_order NULL. Under the turn rules that means
 * no turn is ever open, so every submission is rejected and no turn timer runs
 * — the group is stuck with nothing to advance it. This heals such an instance
 * on the next state read.
 *
 * Steps already submitted keep their existing letters: the recovered order puts
 * their authors first, in that letter order, and shuffles only the players who
 * have yet to go. Resuming at the count of existing steps therefore hands the
 * turn to the first player who hasn't submitted, exactly where the round left off.
 */
export async function ensureRound2TurnState(instanceId: number | string, groupId: number | string): Promise<void> {
    const data = await getInstanceById(instanceId);
    if (!data) return;
    const { instance, template } = data;
    if (instance.status !== 'round2' || instance.round2_phase !== 'submit') return;
    if (instance.round2_turn_index !== null) return;

    const [stepRows] = await query<any>(
        'SELECT participant_id, step_letter FROM cc_round2_steps WHERE instance_id = ? ORDER BY step_letter ASC',
        [instanceId]
    );
    const alreadySubmitted = (stepRows || []).map((r: any) => Number(r.participant_id));

    const [participantRows] = await query<any>(
        `SELECT id FROM game_participants WHERE group_id = ?
         ORDER BY COALESCE(email_verified_at, created_at) ASC, id ASC`,
        [groupId]
    );
    const remaining = (participantRows || [])
        .map((r: any) => Number(r.id))
        .filter((id: number) => !alreadySubmitted.includes(id));
    for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    const order = [...alreadySubmitted, ...remaining];
    if (order.length === 0) return;

    const resumeAt = alreadySubmitted.length;
    const [claimHeader] = await query<any>(
        `UPDATE cc_game_instances SET round2_turn_order = ?, round2_turn_index = ?, round2_turn_started_at = NOW(), updated_at = NOW()
         WHERE id = ? AND round2_turn_index IS NULL`,
        [JSON.stringify(order), resumeAt, instanceId]
    );
    if (Number((claimHeader as any)?.affectedRows || 0) === 0) return;

    if (resumeAt >= order.length) {
        await advanceRound2ToReview(instanceId, groupId);
        return;
    }
    io.to(`cc-instance-${instanceId}`).emit('cc_round2_turn_changed', { turn_index: resumeAt });
    await ensureCCTimer(groupId, instanceId, 'cc_round2_turn', template.round2_submit_timer_secs);
}

export async function getRound2TurnParticipantId(
    instanceId: number | string,
    groupId: number | string,
    turnIndex: number | null
): Promise<number | null> {
    if (turnIndex === null || turnIndex < 0) return null;
    const order = await getRound2TurnOrder(instanceId, groupId);
    return order[turnIndex] ?? null;
}

export async function getRound2TurnCount(instanceId: number | string, groupId: number | string): Promise<number> {
    return (await getRound2TurnOrder(instanceId, groupId)).length;
}

/** Where THIS participant sits in the hidden turn order (null if not playing). */
export async function getMyRound2TurnIndex(
    instanceId: number | string,
    groupId: number | string,
    participantId: number | null
): Promise<number | null> {
    if (participantId == null) return null;
    const order = await getRound2TurnOrder(instanceId, groupId);
    const idx = order.indexOf(Number(participantId));
    return idx >= 0 ? idx : null;
}

/**
 * Starts (or restarts) the single active timer for a Cook & Create group's
 * current phase, on the same shared `timers` table Mystery's timerService polls
 * every 5s. Only one cc_* timer is ever active per group — unlike Mystery's
 * timers (several run in parallel), CC's rounds are strictly sequential, so
 * starting a new one first deactivates whatever cc_* timer was running before.
 * That guards against a stale timer firing after the round already advanced
 * via the "everyone finished early" fast path (see checkRound1Completion etc).
 */
export async function ensureCCTimer(
    groupId: number | string,
    instanceId: number | string,
    timerType: string,
    secs: number
): Promise<void> {
    try {
        await query(
            `UPDATE timers SET is_active = 0 WHERE group_id = ? AND timer_type IN (?) AND is_active = 1`,
            [groupId, CC_TIMER_TYPES]
        );
        // reference_id carries the instance id so timerService's expiry handler
        // (which only has the timers row, not the request context) knows which
        // Cook & Create instance to advance.
        await query(
            'INSERT INTO timers (group_id, timer_type, reference_id, expires_at, is_active) VALUES (?, ?, ?, ?, 1)',
            [groupId, timerType, instanceId, moment().add(Number(secs) || 60, 'seconds').toDate()]
        );
    } catch (err: any) {
        console.warn('[cookandcreateService] ensureCCTimer failed:', err.message || err);
    }
}

/**
 * Get or create cook & create game instance for a group
 */
export async function getOrCreateCCInstance(groupId: number | string, activityGameId: number | string | null): Promise<{ instance: CCGameInstance; template: CCGameTemplate } | null> {
    let resolvedActivityGameId: number | string | null = activityGameId;
    if (!resolvedActivityGameId) {
        // Get default activity_game_id for cook&create (slug cook-and-create)
        const [agRows] = await query(
            `SELECT ag.id FROM activity_games ag JOIN activities a ON ag.activity_id = a.id WHERE a.slug = 'cook-and-create' LIMIT 1`
        );
        if (agRows.length === 0) return null;
        resolvedActivityGameId = agRows[0].id;
    }

    const template = await getCCTemplateByGameId(resolvedActivityGameId as number | string);
    if (!template) return null;

    let [rows] = await query(`SELECT * FROM cc_game_instances WHERE group_id = ?`, [groupId]);
    if (rows.length === 0) {
        await query(
            `INSERT INTO cc_game_instances (group_id, template_id, activity_id, status, created_at, updated_at) VALUES (?, ?, 2, 'waiting', NOW(), NOW())`,
            [groupId, template.id]
        );
        [rows] = await query(`SELECT * FROM cc_game_instances WHERE group_id = ?`, [groupId]);
    }

    // Ensure a participant_sessions row exists for everyone currently in the group —
    // this is what lets socketHandler.ts's already-generic presence/departure logic
    // (join_lobby, broadcastPresence, disconnect) work for Cook & Create groups too,
    // with zero changes to that file. role_id stays NULL; CC doesn't use Mystery's
    // role enum (impostor/show_host live on cc_game_instances instead).
    await ensureCCParticipantSessions(groupId);

    return {
        instance: mapInstanceRow(rows[0]),
        template,
    };
}

/**
 * See getOrCreateCCInstance's call site above.
 */
export async function ensureCCParticipantSessions(groupId: number | string): Promise<void> {
    try {
        const participantIds = await getGroupParticipantIds(groupId);
        if (participantIds.length === 0) return;
        const [existingRows] = await query<any>(
            'SELECT participant_id FROM participant_sessions WHERE group_id = ?',
            [groupId]
        );
        const existing = new Set((existingRows || []).map((r: any) => Number(r.participant_id)));
        const missing = participantIds.filter((id) => !existing.has(id));
        if (missing.length === 0) return;
        // participant_sessions has no unique key on (group_id, participant_id),
        // so the read-then-insert above is racy: two concurrent state fetches can
        // both see the same participant as missing and both insert, leaving a
        // duplicate session that fans out every JOIN against this table. Insert
        // each row only if it still doesn't exist, in one statement, so the
        // duplicate window closes at the database rather than in JS.
        for (const id of missing) {
            await query(
                `INSERT INTO participant_sessions (group_id, participant_id, is_online)
                 SELECT ?, ?, 0 FROM DUAL
                 WHERE NOT EXISTS (
                     SELECT 1 FROM participant_sessions WHERE group_id = ? AND participant_id = ?
                 )`,
                [groupId, id, groupId, id]
            );
        }
    } catch (err: any) {
        // Best-effort — presence is a nice-to-have, never block gameplay over it.
        console.warn('[cookandcreateService] ensureCCParticipantSessions failed:', err.message || err);
    }
}

/**
 * Assign random roles (impostor, show host, chefs) to participants
 */
export async function assignCCRoles(instanceId: number | string, participantIds: number[]): Promise<{ impostorId: number | null; showHostId: number | null }> {
    if (participantIds.length === 0) return { impostorId: null, showHostId: null };

    // Shuffle array
    const shuffled = [...participantIds].sort(() => Math.random() - 0.5);

    // First = Impostor (always)
    const impostorId = shuffled[0];
    // If show host enabled and participants >=4: second = show host
    let showHostId: number | null = null;

    const [instanceRows] = await query(
        `SELECT t.show_host_role_enabled FROM cc_game_instances i JOIN cc_game_templates t ON i.template_id = t.id WHERE i.id = ?`,
        [instanceId]
    );
    const showHostEnabled = instanceRows.length > 0 && Boolean(instanceRows[0].show_host_role_enabled);
    if (showHostEnabled && shuffled.length >= 4) {
        showHostId = shuffled[1];
    }

    await query(
        `UPDATE cc_game_instances SET impostor_participant_id = ?, show_host_participant_id = ?, status = 'round1', round1_started_at = ?, updated_at = NOW() WHERE id = ?`,
        [impostorId, showHostId, moment().format('YYYY-MM-DD HH:mm:ss'), instanceId]
    );

    return { impostorId, showHostId };
}

/**
 * Save ingredient votes for round 1
 */
export async function saveRound1Votes(instanceId: number | string, participantId: number | string, ingredientIds: number[]) {
    // Delete existing votes first
    await query(`DELETE FROM cc_round1_votes WHERE instance_id = ? AND participant_id = ?`, [instanceId, participantId]);
    const values = ingredientIds.map((ingId) => [instanceId, participantId, ingId, moment().format('YYYY-MM-DD HH:mm:ss')]);
    if (values.length > 0) {
        await query(
            `INSERT INTO cc_round1_votes (instance_id, participant_id, ingredient_id, created_at) VALUES ?`,
            // @ts-ignore
            [values]
        );
    }
    return true;
}

/**
 * Calculate round 1 results and save top N ingredients
 */
export async function calculateRound1Results(instanceId: number | string, topCount: number): Promise<{ ingredientId: number; count: number }[]> {
    const [votes] = await query(
        `SELECT ingredient_id, COUNT(*) as c FROM cc_round1_votes WHERE instance_id = ? GROUP BY ingredient_id ORDER BY c DESC, ingredient_id ASC`,
        [instanceId]
    );
    const results = votes.map((v: any) => ({ ingredientId: Number(v.ingredient_id), count: Number(v.c) })).slice(0, topCount);

    // Delete existing selected ingredients for this instance
    await query(`DELETE FROM cc_round1_selected_ingredients WHERE instance_id = ?`, [instanceId]);
    const values = results.map((r, i) => [instanceId, r.ingredientId, r.count, i + 1]);
    if (values.length > 0) {
        await query(
            `INSERT INTO cc_round1_selected_ingredients (instance_id, ingredient_id, vote_count, \`rank\`) VALUES ?`,
            // @ts-ignore
            [values]
        );
    }
    return results;
}

/**
 * Round 1 -> Round 2. Idempotent: the UPDATE...WHERE status='round1' claim
 * ensures only the first caller (the "everyone voted" fast path in
 * checkRound1Completion, or the timer expiry in timerService.ts) actually
 * applies the transition — the same claim pattern verdictScoringService.ts
 * uses for Mystery's finalizeVerdict.
 */
export async function finalizeRound1(instanceId: number | string, groupId: number | string): Promise<void> {
    const data = await getInstanceById(instanceId);
    if (!data) return;
    const { template } = data;

    const [claimHeader] = await query<any>(
        `UPDATE cc_game_instances SET status = 'round2', round1_ended_at = NOW(), round2_started_at = NOW(), updated_at = NOW() WHERE id = ? AND status = 'round1'`,
        [instanceId]
    );
    if (Number((claimHeader as any)?.affectedRows || 0) === 0) return;

    const results = await calculateRound1Results(instanceId, template.round1_top_ingredients);

    io.to(`cc-instance-${instanceId}`).emit('cc_round1_complete', { top_ingredients: results });

    // Round 2 is turn-based: fix a hidden, shuffled turn order and open the
    // first player's turn rather than starting one shared submission window.
    await assignRound2TurnOrder(instanceId, groupId);
    await query(
        `UPDATE cc_game_instances SET round2_turn_index = 0, round2_turn_started_at = NOW(), updated_at = NOW() WHERE id = ?`,
        [instanceId]
    );
    io.to(`cc-instance-${instanceId}`).emit('cc_round2_turn_changed', { turn_index: 0 });
    await ensureCCTimer(groupId, instanceId, 'cc_round2_turn', template.round2_submit_timer_secs);
}

/**
 * Called after every round-1 vote submission — checks whether the whole group
 * has now voted and, if so, finalizes immediately instead of waiting for the
 * timer safety net.
 */
export async function checkRound1Completion(instanceId: number | string, groupId: number | string): Promise<void> {
    const participantIds = await getGroupParticipantIds(groupId);
    if (participantIds.length === 0) return;
    const [voterRows] = await query<any>(
        'SELECT DISTINCT participant_id FROM cc_round1_votes WHERE instance_id = ?',
        [instanceId]
    );
    const voted = new Set((voterRows || []).map((r: any) => Number(r.participant_id)));
    if (participantIds.every((id) => voted.has(id))) {
        await finalizeRound1(instanceId, groupId);
    }
}

/**
 * Save a cooking step for round 2
 */
export async function saveRound2Step(instanceId: number | string, participantId: number | string, stepText: string, stepLetter: string): Promise<number> {
    const [existing] = await query(`SELECT id FROM cc_round2_steps WHERE instance_id = ? AND participant_id = ?`, [instanceId, participantId]);
    let stepId: number;
    if (existing.length > 0) {
        await query(`UPDATE cc_round2_steps SET step_text = ? WHERE id = ?`, [stepText, existing[0].id]);
        stepId = Number(existing[0].id);
    } else {
        const [res] = await query(
            `INSERT INTO cc_round2_steps (instance_id, participant_id, step_text, step_letter, created_at) VALUES (?, ?, ?, ?, NOW())`,
            [instanceId, participantId, stepText, stepLetter]
        );
        stepId = Number((res as any).insertId);
    }
    return stepId;
}

/**
 * Save a keep/remove vote for a step
 */
export async function saveRound2StepVote(instanceId: number | string, participantId: number | string, stepId: number | string, vote: 'keep' | 'remove') {
    await query(
        `INSERT INTO cc_round2_step_votes (instance_id, participant_id, step_id, vote, created_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE vote = VALUES(vote)`,
        [instanceId, participantId, stepId, vote]
    );
    return true;
}

/**
 * Round 2 submit -> review. Idempotent claim on round2_phase.
 */
export async function advanceRound2ToReview(instanceId: number | string, groupId: number | string): Promise<void> {
    const data = await getInstanceById(instanceId);
    if (!data) return;
    const { template } = data;

    // round2_review_started_at anchors the review countdown. It must be stamped
    // here rather than reusing round2_started_at, which by now is however long
    // every player's turn took in the past.
    const [claimHeader] = await query<any>(
        `UPDATE cc_game_instances SET round2_phase = 'review', round2_review_started_at = NOW(), updated_at = NOW()
         WHERE id = ? AND status = 'round2' AND round2_phase = 'submit'`,
        [instanceId]
    );
    if (Number((claimHeader as any)?.affectedRows || 0) === 0) return;

    io.to(`cc-instance-${instanceId}`).emit('cc_round2_review_started', {});
    await ensureCCTimer(groupId, instanceId, 'cc_round2_review', template.round2_review_timer_secs);
}

/**
 * Closes the current Round-2 turn and opens the next one — or moves the whole
 * round on to review once the last player has had their turn.
 *
 * Two things race to call this: the player submitting their step (fast path)
 * and their turn timer expiring (safety net, via timerService). The
 * compare-and-set on round2_turn_index means only the first one for a given
 * turn actually advances it, so a submission landing at the same moment the
 * timer fires can't skip a player.
 *
 * A turn that expires without a step simply produces no step for that player —
 * they miss their slot, matching how Round 1 treats a missed vote.
 */
export async function advanceRound2Turn(instanceId: number | string, groupId: number | string): Promise<void> {
    const data = await getInstanceById(instanceId);
    if (!data) return;
    const { instance, template } = data;
    if (instance.status !== 'round2' || instance.round2_phase !== 'submit') return;

    const current = instance.round2_turn_index;
    if (current === null || current === undefined) return;

    const next = Number(current) + 1;
    const [claimHeader] = await query<any>(
        `UPDATE cc_game_instances SET round2_turn_index = ?, round2_turn_started_at = NOW(), updated_at = NOW()
         WHERE id = ? AND status = 'round2' AND round2_phase = 'submit' AND round2_turn_index = ?`,
        [next, instanceId, current]
    );
    if (Number((claimHeader as any)?.affectedRows || 0) === 0) return;

    const turnCount = await getRound2TurnCount(instanceId, groupId);
    if (next >= turnCount) {
        await advanceRound2ToReview(instanceId, groupId);
        return;
    }

    io.to(`cc-instance-${instanceId}`).emit('cc_round2_turn_changed', { turn_index: next });
    await ensureCCTimer(groupId, instanceId, 'cc_round2_turn', template.round2_submit_timer_secs);
}

// NOTE: the old checkRound2SubmitCompletion ("has everyone submitted a step
// yet?") was removed when Round 2 became turn-based — "everyone has had their
// turn" is now exactly advanceRound2Turn running past the last turn index, and
// keeping a second path to review would have let a group with a skipped turn
// resolve twice.

/**
 * Resolves every step's final keep/remove status by simple majority (a tie
 * defaults to "kept" — lenient, per the plan). Idempotent: guarded by whether
 * any step is still in 'submitted' status, so a race between the "everyone
 * voted" fast path and the review-timer expiry can't double-resolve.
 */
export async function finalizeRound2Review(instanceId: number | string, groupId: number | string): Promise<void> {
    const [stepRows] = await query<any>(
        `SELECT s.id,
                (SELECT COUNT(*) FROM cc_round2_step_votes sv WHERE sv.step_id = s.id AND sv.vote = 'keep') as keep_votes,
                (SELECT COUNT(*) FROM cc_round2_step_votes sv WHERE sv.step_id = s.id AND sv.vote = 'remove') as remove_votes
         FROM cc_round2_steps s WHERE s.instance_id = ? AND s.status = 'submitted'`,
        [instanceId]
    );
    if (!stepRows || stepRows.length === 0) return; // already resolved by a concurrent caller

    for (const s of stepRows) {
        const keep = Number(s.keep_votes);
        const remove = Number(s.remove_votes);
        const status = remove > keep ? 'removed' : 'kept'; // ties -> kept
        await query('UPDATE cc_round2_steps SET status = ? WHERE id = ?', [status, s.id]);
    }

    io.to(`cc-instance-${instanceId}`).emit('cc_round2_review_complete', {});
    // Dish naming is untimed (the Show Host submits on their own initiative,
    // per the game design) — no further timer is started here. The next
    // timer (round3 discussion) starts when submitDishName transitions the
    // instance to round3_discussion.
}

/**
 * Called after every round-2 keep/remove vote — checks whether every
 * participant has now voted on every submitted step.
 */
export async function checkRound2ReviewCompletion(instanceId: number | string, groupId: number | string): Promise<void> {
    const participantIds = await getGroupParticipantIds(groupId);
    if (participantIds.length === 0) return;
    const [stepRows] = await query<any>(
        `SELECT id FROM cc_round2_steps WHERE instance_id = ? AND status = 'submitted'`,
        [instanceId]
    );
    if (!stepRows || stepRows.length === 0) return;
    const [voteRows] = await query<any>(
        `SELECT step_id, COUNT(*) as c FROM cc_round2_step_votes WHERE instance_id = ? GROUP BY step_id`,
        [instanceId]
    );
    const votesByStep = new Map<number, number>((voteRows || []).map((r: any) => [Number(r.step_id), Number(r.c)]));
    const allDone = stepRows.every((s: any) => (votesByStep.get(Number(s.id)) || 0) >= participantIds.length);
    if (allDone) {
        await finalizeRound2Review(instanceId, groupId);
    }
}

/**
 * Save a chat message for round 3
 */
export async function saveRound3Message(instanceId: number | string, participantId: number | string, message: string, isImpostorPrivate = false): Promise<number> {
    const [res] = await query(
        `INSERT INTO cc_round3_messages (instance_id, participant_id, message, is_impostor_private, created_at) VALUES (?, ?, ?, ?, NOW())`,
        [instanceId, participantId, message, isImpostorPrivate ? 1 : 0]
    );
    return Number((res as any).insertId);
}

/**
 * Save an impostor vote for round 3
 */
export async function saveRound3ImpostorVote(instanceId: number | string, participantId: number | string, votedForId: number | string): Promise<void> {
    await query(
        `INSERT INTO cc_round3_impostor_votes (instance_id, participant_id, voted_for_participant_id, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE voted_for_participant_id = VALUES(voted_for_participant_id)`,
        [instanceId, participantId, votedForId]
    );
}

/**
 * Starts the Round 3 discussion timer. Called once the Show Host names the
 * dish and the instance transitions to round3_discussion (see
 * cookandcreateController.submitDishName).
 */
export async function startRound3DiscussionTimer(groupId: number | string, instanceId: number | string): Promise<void> {
    const data = await getInstanceById(instanceId);
    if (!data) return;
    await ensureCCTimer(groupId, instanceId, 'cc_round3_discussion', data.template.round3_discussion_timer_secs);
}

/**
 * Round 3 discussion -> voting. Timer-driven only — unlike the other rounds,
 * open-ended group chat has no natural "everyone's done" signal, so this is
 * called exclusively from timerService's cc_round3_discussion case (still
 * idempotent via the status claim, matching every other transition here).
 */
export async function advanceRound3ToVoting(instanceId: number | string, groupId: number | string): Promise<void> {
    const data = await getInstanceById(instanceId);
    if (!data) return;
    const { template, instance } = data;

    const [claimHeader] = await query<any>(
        `UPDATE cc_game_instances SET status = 'round3_voting', round3_discussion_ended_at = NOW(), round3_voting_started_at = NOW(), updated_at = NOW() WHERE id = ? AND status = 'round3_discussion'`,
        [instanceId]
    );
    if (Number((claimHeader as any)?.affectedRows || 0) === 0) return;

    io.to(`cc-instance-${instanceId}`).emit('cc_round3_voting_started', {});
    await ensureCCTimer(groupId, instanceId, 'cc_round3_voting', template.round3_voting_timer_secs);
    await offerDoubleDown(instanceId, groupId, instance.impostor_participant_id);
}

/**
 * The "Double Down Moment" — the system secretly offers ONE random
 * non-impostor participant the power to double their Round 3 vote's weight,
 * at the risk of a -50 point penalty if their target turns out not to be the
 * impostor (see finalizeRound3). Excludes the impostor — they always "know"
 * who's guilty, so the risk/reward framing doesn't apply to them. Delivered
 * privately via the target's own socket only, the same pattern Mystery's
 * witness-passcard bonus uses (gameEngineController.useWitnessPasscard) —
 * never broadcast to the room. Best-effort: never blocks the round
 * transition if it fails.
 */
async function offerDoubleDown(instanceId: number | string, groupId: number | string, impostorId: number | null): Promise<void> {
    try {
        const participantIds = await getGroupParticipantIds(groupId);
        const eligible = participantIds.filter((id) => id !== impostorId);
        if (eligible.length === 0) return;

        const chosen = eligible[Math.floor(Math.random() * eligible.length)];
        await query(
            `UPDATE cc_game_instances SET double_down_participant_id = ?, double_down_status = 'offered' WHERE id = ?`,
            [chosen, instanceId]
        );

        const [sessionRows] = await query<any>(
            'SELECT socket_id FROM participant_sessions WHERE group_id = ? AND participant_id = ? LIMIT 1',
            [groupId, chosen]
        );
        const socketId = sessionRows?.[0]?.socket_id;
        if (socketId) {
            io.to(socketId).emit('cc_double_down_offer', {});
        }
    } catch (err: any) {
        console.warn('[cookandcreateService] offerDoubleDown failed:', err.message || err);
    }
}

/**
 * Records the targeted participant's Accept/Decline response to the Double
 * Down offer. Idempotent — only the first response is honored.
 */
export async function respondToDoubleDown(
    instanceId: number | string,
    participantId: number | string,
    accept: boolean
): Promise<void> {
    await query(
        `UPDATE cc_game_instances SET double_down_status = ?
         WHERE id = ? AND double_down_participant_id = ? AND double_down_status = 'offered'`,
        [accept ? 'accepted' : 'declined', instanceId, participantId]
    );
}

/**
 * Round 3 finalize & reveal. Idempotent claim on status. Also marks the parent
 * game_groups row completed (same 1-hour retention window Mystery uses) —
 * that's what makes the group show up in the organizer's existing Results tab
 * (organizerController.getOrganizerResults, already generic — no changes
 * needed there) and enter the existing retention-purge sweep.
 */
export async function finalizeRound3(instanceId: number | string, groupId: number | string): Promise<void> {
    const [claimHeader] = await query<any>(
        `UPDATE cc_game_instances SET status = 'completed', round3_voting_ended_at = NOW(), finished_at = NOW(), updated_at = NOW() WHERE id = ? AND status = 'round3_voting'`,
        [instanceId]
    );
    if (Number((claimHeader as any)?.affectedRows || 0) === 0) return;

    const [instRows] = await query<any>(
        `SELECT impostor_participant_id, double_down_participant_id, double_down_status FROM cc_game_instances WHERE id = ?`,
        [instanceId]
    );
    const instRow = instRows?.[0] || {};
    const actualImpostorId = instRow.impostor_participant_id ? Number(instRow.impostor_participant_id) : null;
    const doubleDownParticipantId = instRow.double_down_participant_id ? Number(instRow.double_down_participant_id) : null;
    const doubleDownAccepted = instRow.double_down_status === 'accepted';

    // The Double Down participant's vote counts twice if they accepted.
    const [voteRows] = await query<any>(
        `SELECT voted_for_participant_id,
                SUM(CASE WHEN participant_id = ? AND ? THEN 2 ELSE 1 END) AS vote_count
         FROM cc_round3_impostor_votes WHERE instance_id = ?
         GROUP BY voted_for_participant_id ORDER BY vote_count DESC LIMIT 1`,
        [doubleDownParticipantId, doubleDownAccepted, instanceId]
    );
    const mostVotedId = voteRows.length > 0 ? Number(voteRows[0].voted_for_participant_id) : null;
    const groupWon = mostVotedId != null && actualImpostorId != null && mostVotedId === actualImpostorId;

    await query(`UPDATE cc_game_instances SET group_won = ? WHERE id = ?`, [groupWon ? 1 : 0, instanceId]);

    // Double Down penalty: -50 points if the participant doubled down and
    // their own vote target wasn't the actual impostor. Reuses the same
    // participant_sessions.total_score + score_logs infra Mystery's own
    // per-action scoring already writes to (e.g. witness-passcard bonus in
    // gameEngineController.useWitnessPasscard) — this stays a single-event
    // adjustment for this one participant, not a general CC leaderboard.
    let doubleDownPenaltyApplied = false;
    if (doubleDownAccepted && doubleDownParticipantId != null) {
        const [ddVoteRows] = await query<any>(
            `SELECT voted_for_participant_id FROM cc_round3_impostor_votes WHERE instance_id = ? AND participant_id = ? LIMIT 1`,
            [instanceId, doubleDownParticipantId]
        );
        const ddTarget = ddVoteRows?.[0]?.voted_for_participant_id ? Number(ddVoteRows[0].voted_for_participant_id) : null;
        const ddWasWrong = ddTarget != null && actualImpostorId != null && ddTarget !== actualImpostorId;
        if (ddWasWrong) {
            const [sessionRows] = await query<any>(
                'SELECT id FROM participant_sessions WHERE group_id = ? AND participant_id = ? LIMIT 1',
                [groupId, doubleDownParticipantId]
            );
            const sessionId = sessionRows?.[0]?.id;
            if (sessionId) {
                await query('UPDATE participant_sessions SET total_score = total_score - 50 WHERE id = ?', [sessionId]);
                await query(
                    `INSERT INTO score_logs (participant_session_id, points, reason, created_at, updated_at)
                        VALUES (?, -50, 'cc_double_down_wrong', NOW(), NOW())`,
                    [sessionId]
                );
                doubleDownPenaltyApplied = true;
            }
        }
    }

    const completedAt = new Date();
    const retentionPurgeAt = moment(completedAt).add(1, 'hour').toDate();
    await query(
        `UPDATE game_groups SET status = 'completed', completed_at = ?, retention_purge_at = ? WHERE id = ? AND status NOT IN ('completed', 'incomplete')`,
        [completedAt, retentionPurgeAt, groupId]
    );

    io.to(`cc-instance-${instanceId}`).emit('cc_round3_complete', {
        most_voted_id: mostVotedId,
        actual_impostor_id: actualImpostorId,
        group_won: groupWon,
        double_down_participant_id: doubleDownParticipantId,
        double_down_used: doubleDownAccepted,
        double_down_penalty_applied: doubleDownPenaltyApplied,
    });
}

/**
 * Called after every round-3 impostor vote — checks whether everyone (impostor
 * included, they vote too per the game design) has now voted.
 */
export async function checkRound3VotingCompletion(instanceId: number | string, groupId: number | string): Promise<void> {
    const participantIds = await getGroupParticipantIds(groupId);
    if (participantIds.length === 0) return;
    const [voterRows] = await query<any>(
        'SELECT DISTINCT participant_id FROM cc_round3_impostor_votes WHERE instance_id = ?',
        [instanceId]
    );
    const voted = new Set((voterRows || []).map((r: any) => Number(r.participant_id)));
    if (participantIds.every((id) => voted.has(id))) {
        await finalizeRound3(instanceId, groupId);
    }
}

/**
 * Get rating categories
 */
export async function getCCRatingCategories(): Promise<{ id: number; name: string; slug: string; emoji: string | null; description: string | null }[]> {
    const [rows] = await query(`SELECT id, name, slug, emoji, description FROM cc_rating_categories WHERE status = 'active' ORDER BY \`order\` ASC`);
    return rows.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        slug: r.slug,
        emoji: r.emoji,
        description: r.description,
    }));
}

/**
 * Admin-editable game rules for the lobby screen (Laravel admin: Cook &
 * Create > Templates), same shape/pattern as Mystery's game_rules.
 */
export async function getCCRules(templateId: number | string): Promise<{ id: number; rule_text: string; order: number }[]> {
    const [rows] = await query<any>(
        `SELECT id, rule_text, \`order\` FROM cc_game_rules WHERE template_id = ? ORDER BY \`order\` ASC`,
        [templateId]
    );
    return (rows || []).map((r: any) => ({ id: Number(r.id), rule_text: r.rule_text, order: Number(r.order) }));
}

/* ==========================================================================
 * Cross-group rating & awards (Part 3). A group only gets to rate/be-rated
 * once its own game is 'completed' with a dish_name set. All groups compared
 * are scoped to the same organizer_bookings row (one "event") — ratings never
 * cross bookings.
 * ======================================================================== */

export type CCOtherDish = {
    group_id: number;
    group_name: string;
    dish_name: string;
    nomination_counts: Record<string, number>;
    /** The dish's final recipe — its kept Round-2 steps, in order. */
    steps: { letter: string; text: string }[];
};

/**
 * Up to 3 random *other* completed groups in the same booking, excluding any
 * group this participant has already nominated in any category — so the pool
 * naturally shrinks to unseen groups as the participant keeps rating.
 */
export async function getOtherDishes(groupId: number | string, participantId: number | string): Promise<CCOtherDish[]> {
    const [groupRows] = await query<any>('SELECT booking_id FROM game_groups WHERE id = ?', [groupId]);
    if (!groupRows || groupRows.length === 0) return [];
    const bookingId = groupRows[0].booking_id;

    const [rows] = await query<any>(
        `SELECT gg.id as group_id, gg.group_name, ci.id AS instance_id, ci.dish_name
         FROM game_groups gg
         JOIN cc_game_instances ci ON ci.group_id = gg.id
         WHERE gg.booking_id = ? AND gg.id != ? AND ci.status = 'completed' AND ci.dish_name IS NOT NULL
           AND gg.id NOT IN (
             SELECT rated_group_id FROM cc_ratings WHERE voting_participant_id = ? AND rated_group_id IS NOT NULL
           )
         ORDER BY RAND() LIMIT 3`,
        [bookingId, groupId, participantId]
    );
    if (!rows || rows.length === 0) return [];

    const groupIds = rows.map((r: any) => Number(r.group_id));
    const [countRows] = await query<any>(
        `SELECT r.rated_group_id, rc.slug, COUNT(*) as c
         FROM cc_ratings r JOIN cc_rating_categories rc ON rc.id = r.category_id
         WHERE r.rated_group_id IN (?) GROUP BY r.rated_group_id, rc.slug`,
        [groupIds]
    );
    const countsByGroup = new Map<number, Record<string, number>>();
    for (const c of countRows || []) {
        const gid = Number(c.rated_group_id);
        if (!countsByGroup.has(gid)) countsByGroup.set(gid, {});
        countsByGroup.get(gid)![c.slug] = Number(c.c);
    }

    // Each dish's final recipe = its kept Round-2 steps, in letter order. Removed
    // steps are excluded (they aren't part of the finished dish).
    const instanceIds = rows.map((r: any) => Number(r.instance_id));
    const [stepRows] = await query<any>(
        `SELECT instance_id, step_letter, step_text FROM cc_round2_steps
         WHERE instance_id IN (?) AND status != 'removed'
         ORDER BY instance_id, step_letter ASC`,
        [instanceIds]
    );
    const stepsByInstance = new Map<number, { letter: string; text: string }[]>();
    for (const s of stepRows || []) {
        const iid = Number(s.instance_id);
        if (!stepsByInstance.has(iid)) stepsByInstance.set(iid, []);
        stepsByInstance.get(iid)!.push({ letter: s.step_letter, text: s.step_text });
    }

    return rows.map((r: any) => ({
        group_id: Number(r.group_id),
        group_name: r.group_name,
        dish_name: r.dish_name,
        nomination_counts: countsByGroup.get(Number(r.group_id)) || {},
        steps: stepsByInstance.get(Number(r.instance_id)) || [],
    }));
}

/**
 * Records one participant's award nomination for another group's dish.
 * One nomination per (participant, rated group, category) — re-tapping the
 * same category for the same group is a harmless idempotent no-op via the
 * unique key added in schemaHelpers.ts.
 */
export async function submitRating(
    instanceId: number | string,
    participantId: number | string,
    ratedGroupId: number | string,
    categoryId: number | string
): Promise<void> {
    await query(
        `INSERT INTO cc_ratings (instance_id, category_id, voting_participant_id, rated_group_id, created_at)
         VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE created_at = created_at`,
        [instanceId, categoryId, participantId, ratedGroupId]
    );
}

export type CCAwardEntry = {
    group_id: number;
    group_name: string;
    dish_name: string | null;
    awards: { category_id: number; category_name: string; emoji: string | null; slug: string }[];
};

export type CCAwardsBoard = {
    groups: CCAwardEntry[];
    my_group: {
        impostor_participant_id: number | null;
        most_voted_participant_id: number | null;
        group_won: boolean | null;
        dish_name: string | null;
        double_down_participant_id: number | null;
        double_down_used: boolean;
        double_down_penalty_applied: boolean;
        /** How many nominations this group's dish received, per category slug. */
        reaction_counts: Record<string, number>;
    };
};

/**
 * The Final Results / Leaderboard board: every completed group in this
 * group's booking, plus whichever award category each one leads (most
 * nominations wins; earliest cc_game_instances.finished_at breaks ties),
 * plus this group's own impostor reveal.
 */
export async function getAwards(groupId: number | string): Promise<CCAwardsBoard | null> {
    const [groupRows] = await query<any>('SELECT booking_id FROM game_groups WHERE id = ?', [groupId]);
    if (!groupRows || groupRows.length === 0) return null;
    const bookingId = groupRows[0].booking_id;

    const [groupsRows] = await query<any>(
        `SELECT gg.id as group_id, gg.group_name, ci.dish_name, ci.finished_at
         FROM game_groups gg JOIN cc_game_instances ci ON ci.group_id = gg.id
         WHERE gg.booking_id = ? AND ci.status = 'completed' AND ci.dish_name IS NOT NULL`,
        [bookingId]
    );

    const categories = await getCCRatingCategories();

    const [tallyRows] = await query<any>(
        `SELECT r.category_id, r.rated_group_id, COUNT(*) as c
         FROM cc_ratings r
         JOIN game_groups gg ON gg.id = r.rated_group_id
         WHERE gg.booking_id = ?
         GROUP BY r.category_id, r.rated_group_id`,
        [bookingId]
    );

    const finishedAtByGroup = new Map<number, number>();
    for (const g of groupsRows || []) {
        finishedAtByGroup.set(Number(g.group_id), g.finished_at ? Date.parse(g.finished_at) : Number.MAX_SAFE_INTEGER);
    }

    const byCategory = new Map<number, Map<number, number>>();
    for (const t of tallyRows || []) {
        const catId = Number(t.category_id);
        if (!byCategory.has(catId)) byCategory.set(catId, new Map());
        byCategory.get(catId)!.set(Number(t.rated_group_id), Number(t.c));
    }

    const awardWinnerByCategory = new Map<number, number>();
    for (const cat of categories) {
        const tally = byCategory.get(cat.id);
        if (!tally || tally.size === 0) continue;
        let bestGroupId: number | null = null;
        let bestCount = -1;
        let bestFinishedAt = Number.MAX_SAFE_INTEGER;
        for (const [gid, count] of tally.entries()) {
            const finishedAt = finishedAtByGroup.get(gid) ?? Number.MAX_SAFE_INTEGER;
            if (count > bestCount || (count === bestCount && finishedAt < bestFinishedAt)) {
                bestCount = count;
                bestGroupId = gid;
                bestFinishedAt = finishedAt;
            }
        }
        if (bestGroupId != null) awardWinnerByCategory.set(cat.id, bestGroupId);
    }

    const groups: CCAwardEntry[] = (groupsRows || []).map((g: any) => {
        const gid = Number(g.group_id);
        return {
            group_id: gid,
            group_name: g.group_name,
            dish_name: g.dish_name,
            awards: categories
                .filter((cat) => awardWinnerByCategory.get(cat.id) === gid)
                .map((cat) => ({ category_id: cat.id, category_name: cat.name, emoji: cat.emoji, slug: cat.slug })),
        };
    });

    const [myInstanceRows] = await query<any>(
        `SELECT id, impostor_participant_id, group_won, dish_name, double_down_participant_id, double_down_status
         FROM cc_game_instances WHERE group_id = ?`,
        [groupId]
    );
    const myInstance = myInstanceRows?.[0];
    const doubleDownParticipantId = myInstance?.double_down_participant_id ? Number(myInstance.double_down_participant_id) : null;
    const doubleDownAccepted = myInstance?.double_down_status === 'accepted';

    let mostVotedId: number | null = null;
    let doubleDownWasWrong = false;
    if (myInstance) {
        // Same weighting finalizeRound3 used to decide the actual outcome —
        // keep this display query consistent with it.
        const [voteRows] = await query<any>(
            `SELECT voted_for_participant_id,
                    SUM(CASE WHEN participant_id = ? AND ? THEN 2 ELSE 1 END) AS vote_count
             FROM cc_round3_impostor_votes WHERE instance_id = ?
             GROUP BY voted_for_participant_id ORDER BY vote_count DESC LIMIT 1`,
            [doubleDownParticipantId, doubleDownAccepted, myInstance.id]
        );
        mostVotedId = voteRows.length > 0 ? Number(voteRows[0].voted_for_participant_id) : null;

        if (doubleDownAccepted && doubleDownParticipantId != null) {
            const [ddVoteRows] = await query<any>(
                `SELECT voted_for_participant_id FROM cc_round3_impostor_votes WHERE instance_id = ? AND participant_id = ? LIMIT 1`,
                [myInstance.id, doubleDownParticipantId]
            );
            const ddTarget = ddVoteRows?.[0]?.voted_for_participant_id ? Number(ddVoteRows[0].voted_for_participant_id) : null;
            const actualImpostorId = myInstance.impostor_participant_id ? Number(myInstance.impostor_participant_id) : null;
            doubleDownWasWrong = ddTarget != null && actualImpostorId != null && ddTarget !== actualImpostorId;
        }
    }

    // Reaction tallies this group's own dish received — the same per-category
    // nomination counts getOtherDishes exposes for other teams, surfaced here so
    // the results screen can show "your dish's reactions".
    const reactionCounts: Record<string, number> = {};
    if (myInstance) {
        const [reactionRows] = await query<any>(
            `SELECT rc.slug, COUNT(*) AS c
             FROM cc_ratings r JOIN cc_rating_categories rc ON rc.id = r.category_id
             WHERE r.rated_group_id = ? GROUP BY rc.slug`,
            [groupId]
        );
        for (const row of reactionRows || []) reactionCounts[row.slug] = Number(row.c);
    }

    return {
        groups,
        my_group: {
            impostor_participant_id: myInstance?.impostor_participant_id ? Number(myInstance.impostor_participant_id) : null,
            most_voted_participant_id: mostVotedId,
            group_won: myInstance?.group_won == null ? null : Boolean(myInstance.group_won),
            dish_name: myInstance?.dish_name ?? null,
            double_down_participant_id: doubleDownParticipantId,
            double_down_used: doubleDownAccepted,
            double_down_penalty_applied: doubleDownAccepted && doubleDownWasWrong,
            reaction_counts: reactionCounts,
        },
    };
}
