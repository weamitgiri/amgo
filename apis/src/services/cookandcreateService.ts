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
};

/**
 * Get default ingredients for Cook & Create activity
 */
export async function getCCIngredients(activityId: number | string = 2): Promise<CCIngredient[]> {
    const [rows] = await query(
        `SELECT id, name, image_url, is_absurd FROM cc_ingredients WHERE activity_id = ? AND status = 'active' ORDER BY id ASC`,
        [activityId]
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

const CC_TIMER_TYPES = ['cc_round1', 'cc_round2_submit', 'cc_round2_review', 'cc_round3_discussion', 'cc_round3_voting'];

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
        const values = missing.map((id) => [groupId, id, 0]);
        await query(
            'INSERT INTO participant_sessions (group_id, participant_id, is_online) VALUES ?',
            // @ts-ignore
            [values]
        );
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
    await ensureCCTimer(groupId, instanceId, 'cc_round2_submit', template.round2_submit_timer_secs);
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

    const [claimHeader] = await query<any>(
        `UPDATE cc_game_instances SET round2_phase = 'review', updated_at = NOW() WHERE id = ? AND status = 'round2' AND round2_phase = 'submit'`,
        [instanceId]
    );
    if (Number((claimHeader as any)?.affectedRows || 0) === 0) return;

    io.to(`cc-instance-${instanceId}`).emit('cc_round2_review_started', {});
    await ensureCCTimer(groupId, instanceId, 'cc_round2_review', template.round2_review_timer_secs);
}

/**
 * Called after every round-2 step submission — every participant (impostor
 * included, per the game design) submits one step. Once everyone has, move
 * straight to the review/voting sub-phase instead of waiting for the timer.
 */
export async function checkRound2SubmitCompletion(instanceId: number | string, groupId: number | string): Promise<void> {
    const participantIds = await getGroupParticipantIds(groupId);
    if (participantIds.length === 0) return;
    const [stepRows] = await query<any>(
        'SELECT DISTINCT participant_id FROM cc_round2_steps WHERE instance_id = ?',
        [instanceId]
    );
    const submitted = new Set((stepRows || []).map((r: any) => Number(r.participant_id)));
    if (participantIds.every((id) => submitted.has(id))) {
        await advanceRound2ToReview(instanceId, groupId);
    }
}

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
    const { template } = data;

    const [claimHeader] = await query<any>(
        `UPDATE cc_game_instances SET status = 'round3_voting', round3_discussion_ended_at = NOW(), round3_voting_started_at = NOW(), updated_at = NOW() WHERE id = ? AND status = 'round3_discussion'`,
        [instanceId]
    );
    if (Number((claimHeader as any)?.affectedRows || 0) === 0) return;

    io.to(`cc-instance-${instanceId}`).emit('cc_round3_voting_started', {});
    await ensureCCTimer(groupId, instanceId, 'cc_round3_voting', template.round3_voting_timer_secs);
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

    const [voteRows] = await query<any>(
        `SELECT voted_for_participant_id, COUNT(*) AS vote_count
         FROM cc_round3_impostor_votes WHERE instance_id = ?
         GROUP BY voted_for_participant_id ORDER BY vote_count DESC LIMIT 1`,
        [instanceId]
    );
    const mostVotedId = voteRows.length > 0 ? Number(voteRows[0].voted_for_participant_id) : null;

    const [instRows] = await query<any>(`SELECT impostor_participant_id FROM cc_game_instances WHERE id = ?`, [instanceId]);
    const actualImpostorId =
        instRows.length > 0 && instRows[0].impostor_participant_id ? Number(instRows[0].impostor_participant_id) : null;
    const groupWon = mostVotedId != null && actualImpostorId != null && mostVotedId === actualImpostorId;

    await query(`UPDATE cc_game_instances SET group_won = ? WHERE id = ?`, [groupWon ? 1 : 0, instanceId]);

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
        `SELECT gg.id as group_id, gg.group_name, ci.dish_name
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

    return rows.map((r: any) => ({
        group_id: Number(r.group_id),
        group_name: r.group_name,
        dish_name: r.dish_name,
        nomination_counts: countsByGroup.get(Number(r.group_id)) || {},
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
        'SELECT id, impostor_participant_id, group_won, dish_name FROM cc_game_instances WHERE group_id = ?',
        [groupId]
    );
    const myInstance = myInstanceRows?.[0];

    let mostVotedId: number | null = null;
    if (myInstance) {
        const [voteRows] = await query<any>(
            `SELECT voted_for_participant_id, COUNT(*) AS c FROM cc_round3_impostor_votes
             WHERE instance_id = ? GROUP BY voted_for_participant_id ORDER BY c DESC LIMIT 1`,
            [myInstance.id]
        );
        mostVotedId = voteRows.length > 0 ? Number(voteRows[0].voted_for_participant_id) : null;
    }

    return {
        groups,
        my_group: {
            impostor_participant_id: myInstance?.impostor_participant_id ? Number(myInstance.impostor_participant_id) : null,
            most_voted_participant_id: mostVotedId,
            group_won: myInstance?.group_won == null ? null : Boolean(myInstance.group_won),
            dish_name: myInstance?.dish_name ?? null,
        },
    };
}
