import { Request, Response } from 'express';
import { query } from '../config/db';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import {
    assignCCRoles,
    checkRound1Completion,
    checkRound2ReviewCompletion,
    checkRound3VotingCompletion,
    finalizeRound1,
    finalizeRound3,
    getAwards,
    getCCIngredients,
    getCCRatingCategories,
    getCCRules,
    getInstanceById,
    getOrCreateCCInstance,
    getOtherDishes as getOtherDishesService,
    advanceRound2Turn,
    advanceRound3ToVoting,
    getRound2TurnParticipantId,
    getRound2TurnCount,
    getMyRound2TurnIndex,
    ensureRound2TurnState,
    ensureRound2ReviewStartedAt,
    round2StepLetter,
    respondToDoubleDown,
    saveRound1Votes,
    submitRating,
    saveRound2Step,
    saveRound2StepVote,
    saveRound3ImpostorVote,
    saveRound3Message,
    startRound3DiscussionTimer,
    ensureCCTimer,
} from '../services/cookandcreateService';
import { shortName } from '../utils/pseudonym';
// Read-only reuse of Mystery's schedule parser so both activities interpret a
// booking's date/time identically. buildLobbyPayload itself is NOT used here —
// it starts Mystery's case-summary timer as a side effect.
import { parseBookingSchedule } from '../services/lobbyService';

/**
 * Get Cook & Create game state for a group + current participant
 * (includes roles, round status, ingredients, votes, steps, messages etc.)
 */
export const getCCGameState = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.params;
    const participant_id = req.query.participant_id as string | undefined;
    const myParticipantId = participant_id ? Number(participant_id) : null;

    // Get group + booking + activity/game info
    const [groupRows] = await query(
        `SELECT gg.id, gg.booking_id, gg.game_id, ob.activity_id, ob.game_id as booking_game_id,
                ob.scheduled_date, ob.scheduled_time,
                a.slug AS activity_slug, a.group_size, a.lobby_wait_secs, a.game_duration_secs
         FROM game_groups gg
         JOIN organizer_bookings ob ON gg.booking_id = ob.id
         JOIN activities a ON ob.activity_id = a.id
         WHERE gg.id = ?`,
        [group_id]
    );
    if (groupRows.length === 0) {
        throw new AppError('Group not found', 404);
    }
    const group = groupRows[0];

    // Get or create CC instance
    const ccData = await getOrCreateCCInstance(group_id, group.game_id || group.booking_game_id);
    if (!ccData) {
        throw new AppError('Cook & Create game template not found', 404);
    }
    const { instance, template } = ccData;

    // Get participants in group. Online/offline is live socket presence
    // (participant_sessions.is_online, kept current by socketHandler.ts on
    // join_lobby/disconnect) — NOT game_participants.status, which is an
    // unrelated account-level field and was previously (wrongly) used here,
    // making every participant but yourself show as permanently offline.
    // GROUP BY gp.id is load-bearing, not cosmetic: participant_sessions has no
    // unique key on (group_id, participant_id), and a duplicate row there would
    // otherwise fan this LEFT JOIN out and list the same player twice — which
    // also inflates participants.length, the value the auto-start check below
    // compares against the group capacity.
    const [participantRows] = await query(
        `SELECT gp.id, gp.name, MAX(ps.is_online) AS is_online,
                COALESCE(gp.email_verified_at, gp.created_at) AS joined_at
         FROM game_participants gp
         LEFT JOIN participant_sessions ps ON ps.group_id = gp.group_id AND ps.participant_id = gp.id
         WHERE gp.group_id = ?
         GROUP BY gp.id, gp.name, joined_at
         ORDER BY joined_at ASC, gp.id ASC`,
        [group_id]
    );
    const participants = participantRows.map((p: any) => ({
        id: Number(p.id),
        name: myParticipantId === Number(p.id) ? p.name : shortName(p.name, Number(p.id)),
        isYou: myParticipantId === Number(p.id),
        status: Number(p.is_online) === 1 ? 'online' : 'offline',
    }));
    const participantIds = participants.map((p) => p.id);

    // Auto-start once the group is full (activities.group_size — the same
    // capacity Mystery Quest enforces, NOT round1_top_ingredients, which is an
    // unrelated Round-1 tuning value).
    const groupCapacity = Number(group.group_size) || 5;
    if (instance.status === 'waiting' && participants.length >= groupCapacity) {
        const roles = await assignCCRoles(instance.id, participantIds);
        instance.impostor_participant_id = roles.impostorId;
        instance.show_host_participant_id = roles.showHostId;
        instance.status = 'round1';

        try {
            const { io } = require('../server');
            if (io) io.to(`cc-instance-${instance.id}`).emit('cc_round1_started', {});
        } catch (_e) {
            /* ignore */
        }
        await ensureCCTimer(group_id, instance.id, 'cc_round1', template.round1_timer_secs);
    }

    // Heal a Round 2 that began before turn-based submission existed: without
    // turn state no turn is ever open, so every submission is rejected and no
    // timer runs — the group would sit stuck forever. Done here, before the
    // round-2 reads below, so they all see consistent state (the heal can also
    // move the round straight to review if every step was already in). No-op
    // for every instance that already has turn state.
    if (instance.status === 'round2' && instance.round2_phase === 'submit' && instance.round2_turn_index === null) {
        await ensureRound2TurnState(instance.id, group_id);
        const healed = await getInstanceById(instance.id);
        if (healed) {
            instance.round2_phase = healed.instance.round2_phase;
            instance.round2_turn_index = healed.instance.round2_turn_index;
            instance.round2_turn_started_at = healed.instance.round2_turn_started_at;
        }
    }

    // Same idea for the review countdown's anchor on rounds that reached review
    // before that column existed. No-op once it is set.
    if (instance.status === 'round2' && instance.round2_phase === 'review' && !instance.round2_review_started_at) {
        await ensureRound2ReviewStartedAt(instance.id, group_id);
        const healed = await getInstanceById(instance.id);
        if (healed) instance.round2_review_started_at = healed.instance.round2_review_started_at;
    }

    // Public role labels — the Show Host's identity is public per the game
    // design (everyone sees who's "Chef 1"/"Chef 2"/"Show Host" for Round 3
    // voting), but this must NEVER leak who the impostor is: the impostor gets
    // the same "Chef N" label as everyone else here.
    let chefCounter = 0;
    const participantsWithRoles = participants.map((p) => {
        if (instance.show_host_participant_id === p.id) {
            return { ...p, role_label: 'Show Host' };
        }
        chefCounter += 1;
        return { ...p, role_label: `Chef ${chefCounter}` };
    });

    // Get this template's ingredient pool (admin-selected per template — see
    // getCCIngredients for why this is no longer activity_id-scoped)
    const allIngredients = await getCCIngredients(template.id);
    // Get my ingredient votes
    let myIngredientVotes: number[] = [];
    if (myParticipantId) {
        const [myVotes] = await query(
            `SELECT ingredient_id FROM cc_round1_votes WHERE instance_id = ? AND participant_id = ?`,
            [instance.id, myParticipantId]
        );
        myIngredientVotes = myVotes.map((v: any) => Number(v.ingredient_id));
    }
    // Get total ingredient vote counts (group-level)
    const [groupIngredientVotes] = await query(
        `SELECT ingredient_id, COUNT(*) as vote_count FROM cc_round1_votes WHERE instance_id = ? GROUP BY ingredient_id`,
        [instance.id]
    );
    const ingredientVoteMap = new Map<number, number>();
    groupIngredientVotes.forEach((g: any) => ingredientVoteMap.set(Number(g.ingredient_id), Number(g.vote_count)));

    // Get Round 1 selected top ingredients
    const [selectedIngredientsRows] = await query(
        `SELECT i.id, i.name, i.image_url, i.is_absurd, s.vote_count, s.rank
         FROM cc_round1_selected_ingredients s
         JOIN cc_ingredients i ON s.ingredient_id = i.id
         WHERE s.instance_id = ? ORDER BY s.rank ASC`,
        [instance.id]
    );
    const selectedIngredients = selectedIngredientsRows.map((r: any) => ({
        id: Number(r.id),
        name: r.name,
        image_url: r.image_url,
        is_absurd: Boolean(r.is_absurd),
        vote_count: Number(r.vote_count),
        rank: Number(r.rank),
    }));

    // Round 2: cooking steps
    let cookingSteps: any[] = [];
    let myCookingStep: string | null = null;
    if (instance.status === 'round2' || selectedIngredients.length > 0) {
        const [stepsRows] = await query(
            `SELECT s.id, s.step_letter, s.step_text, s.status,
                    (SELECT COUNT(*) FROM cc_round2_step_votes sv WHERE sv.step_id = s.id AND sv.vote = 'keep') as keep_votes,
                    (SELECT COUNT(*) FROM cc_round2_step_votes sv WHERE sv.step_id = s.id AND sv.vote = 'remove') as remove_votes,
                    s.participant_id
             FROM cc_round2_steps s WHERE s.instance_id = ? ORDER BY s.step_letter ASC`,
            [instance.id]
        );
        cookingSteps = stepsRows.map((s: any) => ({
            id: Number(s.id),
            letter: s.step_letter,
            text: s.step_text,
            status: s.status,
            keep_votes: Number(s.keep_votes),
            remove_votes: Number(s.remove_votes),
            // Never expose who submitted which step — steps are anonymous
            // during review, per the game design (PDF: "Steps appear on
            // screen with no names — just Step A, B, C, D, E").
        }));
        if (myParticipantId) {
            const myStep = stepsRows.find((s: any) => Number(s.participant_id) === myParticipantId);
            myCookingStep = myStep ? myStep.step_text : null;
        }
    }
    // My step votes
    let myStepVotes: Record<number, 'keep' | 'remove'> = {};
    if (myParticipantId && cookingSteps.length > 0) {
        const [myVotes] = await query(
            `SELECT step_id, vote FROM cc_round2_step_votes WHERE instance_id = ? AND participant_id = ?`,
            [instance.id, myParticipantId]
        );
        myVotes.forEach((v: any) => (myStepVotes[Number(v.step_id)] = v.vote));
    }

    // Round 3: Chat messages & votes
    // Only show non-private messages publicly, and private messages only to the impostor
    let chatMessages: any[] = [];
    let myImpostorVote: number | null = null;
    if (instance.status === 'round3_discussion' || instance.status === 'round3_voting' || instance.status === 'completed') {
        const isImpostor = myParticipantId === instance.impostor_participant_id;
        const queryText = isImpostor
            ? `SELECT id, participant_id, message, is_impostor_private, created_at FROM cc_round3_messages WHERE instance_id = ? ORDER BY created_at ASC`
            : `SELECT id, participant_id, message, is_impostor_private, created_at FROM cc_round3_messages WHERE instance_id = ? AND is_impostor_private = 0 ORDER BY created_at ASC`;
        const [msgRows] = await query(queryText, [instance.id]);
        chatMessages = msgRows.map((m: any) => {
            const participant = participants.find((p) => p.id === Number(m.participant_id));
            return {
                id: Number(m.id),
                participant_id: Number(m.participant_id),
                participant_name: participant ? participant.name : 'Unknown',
                is_you: Number(m.participant_id) === myParticipantId,
                message: m.message,
                is_impostor_private: Boolean(m.is_impostor_private),
                created_at: m.created_at,
            };
        });
        if (myParticipantId) {
            const [voteRow] = await query(
                `SELECT voted_for_participant_id FROM cc_round3_impostor_votes WHERE instance_id = ? AND participant_id = ?`,
                [instance.id, myParticipantId]
            );
            if (voteRow.length > 0) {
                myImpostorVote = Number(voteRow[0].voted_for_participant_id);
            }
        }
    }
    // Total votes per participant (for round 3 live counter, anonymous)
    const [impostorVoteCountsRows] = await query(
        `SELECT voted_for_participant_id, COUNT(*) as vote_count FROM cc_round3_impostor_votes WHERE instance_id = ? GROUP BY voted_for_participant_id`,
        [instance.id]
    );
    const impostorVoteCounts = impostorVoteCountsRows.map((v: any) => ({
        voted_for_participant_id: Number(v.voted_for_participant_id),
        count: Number(v.vote_count),
    }));

    // Who has completed the CURRENT step — submission status only, never the
    // content of what they submitted/voted (that stays private per-round,
    // matching the game's anonymity rules). Powers the "Available/Submitted"
    // badges in the sidebar and activity feed.
    let submittedParticipantIds: number[] = [];
    if (instance.status === 'round1') {
        const [rows] = await query(
            'SELECT DISTINCT participant_id FROM cc_round1_votes WHERE instance_id = ?',
            [instance.id]
        );
        submittedParticipantIds = rows.map((r: any) => Number(r.participant_id));
    } else if (instance.status === 'round2' && instance.round2_phase === 'submit') {
        // Deliberately left EMPTY. Turns advance one at a time and everyone can
        // see the current turn index, so publishing who has submitted would let
        // anyone correlate "turn N advanced" with "player X just became
        // submitted" and rebuild the hidden step->author mapping. Round 2's
        // progress is shown per step letter (round2_turn.steps) instead.
    } else if (instance.status === 'round2' && instance.round2_phase === 'review') {
        const submittedStepIds = cookingSteps.filter((s) => s.status === 'submitted').map((s) => s.id);
        if (submittedStepIds.length > 0) {
            const [rows] = await query(
                `SELECT participant_id, COUNT(DISTINCT step_id) as c FROM cc_round2_step_votes
                 WHERE instance_id = ? AND step_id IN (?) GROUP BY participant_id`,
                [instance.id, submittedStepIds]
            );
            submittedParticipantIds = rows
                .filter((r: any) => Number(r.c) >= submittedStepIds.length)
                .map((r: any) => Number(r.participant_id));
        }
    } else if (instance.status === 'round3_voting') {
        const [rows] = await query(
            'SELECT DISTINCT participant_id FROM cc_round3_impostor_votes WHERE instance_id = ?',
            [instance.id]
        );
        submittedParticipantIds = rows.map((r: any) => Number(r.participant_id));
    }

    // Round 2 turn state. Deliberately ANONYMOUS: everyone learns which step
    // letter is being written right now and which are done, but never WHO is
    // writing which step — the review phase depends on steps being untraceable
    // (a step that maps back to a player would hand the group the impostor).
    // The only identity revealed is your own, via is_my_turn/my_turn_index.
    let round2Turn: {
        total: number;
        current_index: number | null;
        started_at: string | null;
        turn_secs: number;
        is_my_turn: boolean;
        my_turn_index: number | null;
        steps: { letter: string; status: 'submitted' | 'current' | 'awaiting' | 'missed' }[];
    } | null = null;
    if (instance.status === 'round2' && instance.round2_phase === 'submit') {
        const turnCount = await getRound2TurnCount(instance.id, group_id);
        const currentIndex = instance.round2_turn_index;
        const turnParticipantId = await getRound2TurnParticipantId(instance.id, group_id, currentIndex);
        // Which letters actually produced a step (a turn can expire unused).
        const submittedLetters = new Set(cookingSteps.map((s) => s.letter));
        // From the hidden shuffled order — NOT this participant's position in
        // the displayed list, which would make every step letter derivable.
        const myTurnIndex = await getMyRound2TurnIndex(instance.id, group_id, myParticipantId);

        round2Turn = {
            total: turnCount,
            current_index: currentIndex,
            started_at: instance.round2_turn_started_at,
            turn_secs: template.round2_submit_timer_secs,
            is_my_turn: myParticipantId != null && turnParticipantId === myParticipantId,
            my_turn_index: myTurnIndex,
            steps: Array.from({ length: turnCount }, (_, i) => {
                const letter = String.fromCharCode(65 + i);
                let status: 'submitted' | 'current' | 'awaiting' | 'missed';
                if (currentIndex !== null && i === currentIndex) status = 'current';
                else if (currentIndex !== null && i < currentIndex) status = submittedLetters.has(letter) ? 'submitted' : 'missed';
                else status = 'awaiting';
                return { letter, status };
            }),
        };
    }

    // Absolute schedule timestamps for the lobby/header countdowns.
    //
    // These are sent as instants rather than "seconds remaining" on purpose: a
    // duration handed to the client restarts from full on every page load, which
    // is exactly why the lobby countdown reset to 2:00 on each refresh. Anchored
    // to a fixed point in time, a refresh just recomputes the same remainder.
    // server_time lets the client cancel out any clock skew between the two.
    const scheduleStart = parseBookingSchedule(group.scheduled_date, group.scheduled_time);
    const lobbyWaitSecs = Number(group.lobby_wait_secs) || 120;
    const gameDurationSecs = Number(group.game_duration_secs) || 1500;
    const gameStartsAt = scheduleStart ? scheduleStart.clone().add(lobbyWaitSecs, 'seconds') : null;
    const schedule = {
        scheduled_start_at: scheduleStart ? scheduleStart.toISOString() : null,
        // When the lobby's entry window closes and play begins.
        game_starts_at: gameStartsAt ? gameStartsAt.toISOString() : null,
        game_ends_at: gameStartsAt ? gameStartsAt.clone().add(gameDurationSecs, 'seconds').toISOString() : null,
        lobby_wait_secs: lobbyWaitSecs,
        game_duration_secs: gameDurationSecs,
        server_time: new Date().toISOString(),
    };

    // Rating categories
    const ratingCategories = await getCCRatingCategories();

    // Admin-editable game rules for the lobby screen
    const rules = await getCCRules(template.id);

    // Role for current user
    let myRole: string | null = null;
    let myRoleLabel: string | null = null;
    let isImpostor = false;
    let isShowHost = false;
    if (myParticipantId) {
        if (myParticipantId === instance.impostor_participant_id) {
            isImpostor = true;
            myRole = 'impostor';
            myRoleLabel = 'The Impostor';
        } else if (myParticipantId === instance.show_host_participant_id) {
            isShowHost = true;
            myRole = 'show_host';
            myRoleLabel = 'Show Host';
        } else {
            myRole = 'chef';
            // Assign a Chef number based on participant order
            const chefIndex = participants
                .filter((p) => p.id !== instance.impostor_participant_id && p.id !== instance.show_host_participant_id)
                .findIndex((p) => p.id === myParticipantId);
            myRoleLabel = chefIndex >= 0 ? `Chef ${chefIndex + 1}` : 'Chef';
        }
    }

    // Round 2 released clues
    const [clueRows] = await query(
        `SELECT c.id, c.clue_text, c.round_number FROM cc_round2_released_clues rc JOIN cc_clues c ON rc.clue_id = c.id WHERE rc.instance_id = ?`,
        [instance.id]
    );
    const releasedClues = clueRows.map((r: any) => ({ id: Number(r.id), text: r.clue_text, round_number: Number(r.round_number) }));

    // The impostor's identity is the one genuine secret in this game — never
    // send it to anyone except the impostor themselves, until the game is
    // over and the reveal is public (finalizeRound3 already broadcasts it via
    // cc_round3_complete at that point).
    const revealImpostor = instance.status === 'completed' || isImpostor;

    // The Double Down offer is "secretly selected" per the game design — only
    // the chosen participant (or everyone, once the game is over) should see
    // who it went to. Everyone else gets my_double_down: null and a redacted
    // instance field, mirroring the impostor redaction above.
    const isDoubleDownTarget = myParticipantId != null && myParticipantId === instance.double_down_participant_id;
    const revealDoubleDown = instance.status === 'completed' || isDoubleDownTarget;
    const myDoubleDown = isDoubleDownTarget ? { offered: true, status: instance.double_down_status } : null;

    // Success response
    return successResponse(res, 'Cook & Create state loaded', {
        instance: {
            ...instance,
            impostor_participant_id: revealImpostor ? instance.impostor_participant_id : null,
            double_down_participant_id: revealDoubleDown ? instance.double_down_participant_id : null,
            double_down_status: revealDoubleDown ? instance.double_down_status : null,
        },
        my_double_down: myDoubleDown,
        template,
        participants: participantsWithRoles,
        submitted_participant_ids: submittedParticipantIds,
        my_participant: myParticipantId
            ? participantsWithRoles.find((p) => p.id === myParticipantId) || null
            : null,
        my_role: myRole,
        my_role_label: myRoleLabel,
        is_impostor: isImpostor,
        is_show_host: isShowHost,
        impostor_bias_card: isImpostor ? template.impostor_bias_card_text : null,
        // Round 1
        all_ingredients: allIngredients,
        my_ingredient_votes: myIngredientVotes,
        ingredient_vote_counts: Object.fromEntries(ingredientVoteMap),
        selected_ingredients: selectedIngredients,
        // Round 2
        cooking_steps: cookingSteps,
        my_cooking_step: myCookingStep,
        my_step_votes: myStepVotes,
        round2_turn: round2Turn,
        released_clues: releasedClues,
        // Round 3
        chat_messages: chatMessages,
        my_impostor_vote: myImpostorVote,
        impostor_vote_counts: impostorVoteCounts,
        // Ratings
        rating_categories: ratingCategories,
        // Dish name
        dish_name: instance.dish_name,
        // Admin-editable game rules (lobby screen)
        rules,
        // Absolute instants for the lobby / header countdowns
        schedule,
    });
});

/**
 * Round 1: Submit ingredient votes
 */
export const submitRound1Votes = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id, participant_id, ingredient_ids } = req.body;
    if (!instance_id || !participant_id || !Array.isArray(ingredient_ids)) {
        throw new AppError('instance_id, participant_id, and ingredient_ids (array) are required', 400);
    }

    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);
    const { instance, template } = data;
    if (instance.status !== 'round1') {
        throw new AppError('Ingredient voting is not open right now', 400);
    }
    if (ingredient_ids.length !== template.round1_votes_per_player) {
        throw new AppError(`You must select exactly ${template.round1_votes_per_player} ingredients`, 400);
    }

    await saveRound1Votes(instance_id, participant_id, ingredient_ids);

    try {
        const { io } = require('../server');
        if (io) {
            // Votes are secret during Round 1 (per the game design — only the
            // top-4 tally is revealed at finalize) — broadcast submission
            // status only, never the actual ingredient_ids chosen.
            io.to(`cc-instance-${instance_id}`).emit('cc_round1_vote_submitted', { participant_id });
        }
    } catch (_e) {
        /* ignore */
    }

    await checkRound1Completion(instance_id, instance.group_id);

    return successResponse(res, 'Votes submitted successfully', {});
});

/**
 * Round 1: Finalize results (all players voted or timer ended)
 */
/**
 * Manual/organizer-triggered fallback — the normal path is automatic, either
 * via checkRound1Completion (everyone voted) or the cc_round1 timer expiry
 * (timerService.ts). finalizeRound1 is idempotent, so calling this when the
 * round has already advanced is a safe no-op.
 */
export const finalizeRound1Results = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id } = req.body;
    if (!instance_id) {
        throw new AppError('instance_id is required', 400);
    }
    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);

    await finalizeRound1(instance_id, data.instance.group_id);

    const [selected] = await query(
        `SELECT ingredient_id, vote_count FROM cc_round1_selected_ingredients WHERE instance_id = ? ORDER BY \`rank\` ASC`,
        [instance_id]
    );
    return successResponse(res, 'Round 1 complete', { top_ingredients: selected });
});

/**
 * Round 2: Submit cooking step
 */
export const submitRound2Step = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id, participant_id, step_text } = req.body;
    if (!instance_id || !participant_id || !step_text) {
        throw new AppError('instance_id, participant_id, and step_text are required', 400);
    }

    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);
    const { instance, template } = data;
    if (instance.status !== 'round2' || instance.round2_phase !== 'submit') {
        throw new AppError('Cooking step submission is not open right now', 400);
    }
    if (String(step_text).length > template.round2_step_max_chars) {
        throw new AppError(`Step text must be ${template.round2_step_max_chars} characters or fewer`, 400);
    }

    // Round 2 is turn-based: only the player whose turn is currently open may
    // submit, and the step's letter comes from that turn's position — never
    // from the client, which can't see enough to assign it without racing.
    // (Heal first, so a round carried over from before turn-based submission
    // can't reject every player for lack of turn state.)
    let turnIndex = instance.round2_turn_index;
    if (turnIndex === null) {
        await ensureRound2TurnState(instance_id, instance.group_id);
        const healed = await getInstanceById(instance_id);
        turnIndex = healed?.instance.round2_turn_index ?? null;
        if (healed && healed.instance.round2_phase !== 'submit') {
            throw new AppError('Cooking step submission is not open right now', 400);
        }
    }
    const turnParticipantId = await getRound2TurnParticipantId(instance_id, instance.group_id, turnIndex);
    if (turnParticipantId === null) {
        throw new AppError('Cooking step submission is not open right now', 400);
    }
    if (turnParticipantId !== Number(participant_id)) {
        throw new AppError("It's not your turn yet — wait for the players before you.", 403);
    }

    const stepId = await saveRound2Step(instance_id, participant_id, step_text, round2StepLetter(turnIndex as number));

    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_round2_step_submitted', { step_id: stepId, participant_id });
        }
    } catch (_e) {
        /* ignore */
    }

    // Hand the turn to the next player (or close the round if that was the last).
    await advanceRound2Turn(instance_id, instance.group_id);

    return successResponse(res, 'Step submitted successfully', { step_id: stepId });
});

/**
 * Round 2: Submit keep/remove vote for a step
 */
export const submitRound2StepVote = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id, participant_id, step_id, vote } = req.body;
    if (!instance_id || !participant_id || !step_id || (vote !== 'keep' && vote !== 'remove')) {
        throw new AppError('instance_id, participant_id, step_id, and vote (keep/remove) are required', 400);
    }

    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);
    const { instance } = data;
    if (instance.status !== 'round2' || instance.round2_phase !== 'review') {
        throw new AppError('Step review voting is not open right now', 400);
    }

    await saveRound2StepVote(instance_id, participant_id, step_id, vote);

    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_round2_step_vote_submitted', { participant_id, step_id, vote });
        }
    } catch (_e) {
        /* ignore */
    }

    await checkRound2ReviewCompletion(instance_id, instance.group_id);

    return successResponse(res, 'Vote submitted successfully', {});
});

/**
 * Round 2: Save dish name (show host or first to submit)
 */
/**
 * Per the game design, once the review phase resolves everyone can see the
 * final 4 steps; the Show Host has the exclusive right to name the dish (if
 * the Show Host role is enabled for this template and one was assigned —
 * otherwise anyone may, matching the original first-submit-wins behavior).
 */
export const submitDishName = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id, participant_id, dish_name } = req.body;
    if (!instance_id || !dish_name) {
        throw new AppError('instance_id and dish_name are required', 400);
    }

    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);
    const { instance, template } = data;
    if (instance.status !== 'round2' || instance.round2_phase !== 'review') {
        throw new AppError('Dish naming is not open right now', 400);
    }
    if (template.show_host_role_enabled && instance.show_host_participant_id) {
        if (!participant_id || Number(participant_id) !== instance.show_host_participant_id) {
            throw new AppError('Only the Show Host can name the dish', 403);
        }
    }

    const [updateHeader] = await query(
        `UPDATE cc_game_instances SET dish_name = ?, dish_named_by_participant_id = ?, updated_at = NOW() WHERE id = ? AND dish_name IS NULL`,
        [dish_name, participant_id || null, instance_id]
    );
    if (Number((updateHeader as any)?.affectedRows || 0) === 0) {
        throw new AppError('A dish name has already been submitted', 400);
    }

    // Move to round3_discussion
    await query(
        `UPDATE cc_game_instances SET status = 'round3_discussion', round2_ended_at = NOW(), round3_discussion_started_at = NOW(), updated_at = NOW() WHERE id = ?`,
        [instance_id]
    );

    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_dish_name_submitted', { dish_name });
            io.to(`cc-instance-${instance_id}`).emit('cc_round3_discussion_started', {});
        }
    } catch (_e) {
        /* ignore */
    }

    await startRound3DiscussionTimer(instance.group_id, instance_id);

    return successResponse(res, 'Dish name saved', { dish_name });
});

/**
 * Round 3: Send chat message
 */
export const submitRound3Message = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id, participant_id, message, is_impostor_private } = req.body;
    if (!instance_id || !participant_id || !message) {
        throw new AppError('instance_id, participant_id, and message are required', 400);
    }

    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);
    const { instance, template } = data;
    if (instance.status !== 'round3_discussion') {
        throw new AppError('Discussion is not open right now', 400);
    }

    const isPrivate = Boolean(is_impostor_private);
    if (!isPrivate) {
        // "Maximum N messages per player" (PDF) — applies to the public group
        // chat only; the impostor's private hint channel is unlimited.
        const [countRows] = await query<any>(
            `SELECT COUNT(*) as c FROM cc_round3_messages WHERE instance_id = ? AND participant_id = ? AND is_impostor_private = 0`,
            [instance_id, participant_id]
        );
        const used = Number(countRows?.[0]?.c || 0);
        if (used >= template.round3_max_messages_per_player) {
            throw new AppError(`You've used all ${template.round3_max_messages_per_player} of your messages`, 400);
        }
    }

    const msgId = await saveRound3Message(instance_id, participant_id, message, isPrivate);
    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_round3_message_new', { id: msgId, instance_id, participant_id, message, is_impostor_private: isPrivate });
        }
    } catch (_e) {
        /* ignore */
    }
    return successResponse(res, 'Message sent', { message_id: msgId });
});

/**
 * Round 3: Start voting phase
 */
/**
 * Manual/organizer-triggered fallback — normally discussion -> voting is
 * timer-driven (cc_round3_discussion expiry, timerService.ts).
 * advanceRound3ToVoting is idempotent, so this is a safe no-op if the round
 * has already moved on.
 */
export const startRound3Voting = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id } = req.body;
    if (!instance_id) {
        throw new AppError('instance_id is required', 400);
    }
    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);

    await advanceRound3ToVoting(instance_id, data.instance.group_id);

    return successResponse(res, 'Round 3 voting phase started', {});
});

/**
 * Round 3: Submit impostor vote
 */
export const submitRound3ImpostorVote = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id, participant_id, voted_for_participant_id } = req.body;
    if (!instance_id || !participant_id || !voted_for_participant_id) {
        throw new AppError('instance_id, participant_id, and voted_for_participant_id are required', 400);
    }

    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);
    const { instance } = data;
    if (instance.status !== 'round3_voting') {
        throw new AppError('Voting is not open right now', 400);
    }

    await saveRound3ImpostorVote(instance_id, participant_id, voted_for_participant_id);
    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_round3_impostor_vote_submitted', { participant_id, voted_for_participant_id });
        }
    } catch (_e) {
        /* ignore */
    }

    await checkRound3VotingCompletion(instance_id, instance.group_id);

    return successResponse(res, 'Vote submitted', {});
});

/**
 * Round 3: respond to the private "Double Down" offer (Accept doubles this
 * participant's vote weight but risks -50 points if their target is wrong;
 * Decline leaves their vote at normal weight with no risk).
 */
export const respondToDoubleDownHandler = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id, participant_id, accept } = req.body;
    if (!instance_id || !participant_id || typeof accept !== 'boolean') {
        throw new AppError('instance_id, participant_id, and accept (boolean) are required', 400);
    }

    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);
    const { instance } = data;
    if (instance.double_down_participant_id !== Number(participant_id)) {
        throw new AppError('You were not offered the Double Down power', 403);
    }
    if (instance.double_down_status !== 'offered') {
        throw new AppError('You have already responded to the Double Down offer', 400);
    }

    await respondToDoubleDown(instance_id, participant_id, accept);

    return successResponse(res, accept ? 'Double Down accepted' : 'Double Down declined', {});
});

/**
 * Round 3: End voting & reveal. Manual/organizer-triggered fallback — the
 * normal path is automatic (checkRound3VotingCompletion or the cc_round3_voting
 * timer). finalizeRound3 is idempotent, so a redundant call is a safe no-op.
 */
export const finalizeRound3Results = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id } = req.body;
    if (!instance_id) {
        throw new AppError('instance_id is required', 400);
    }
    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);

    await finalizeRound3(instance_id, data.instance.group_id);

    const [instRows] = await query<any>(
        `SELECT impostor_participant_id, group_won FROM cc_game_instances WHERE id = ?`,
        [instance_id]
    );
    const [voteRows] = await query<any>(
        `SELECT voted_for_participant_id, COUNT(*) AS vote_count FROM cc_round3_impostor_votes
         WHERE instance_id = ? GROUP BY voted_for_participant_id ORDER BY vote_count DESC LIMIT 1`,
        [instance_id]
    );

    return successResponse(res, 'Round 3 finalized', {
        most_voted_id: voteRows.length > 0 ? Number(voteRows[0].voted_for_participant_id) : null,
        actual_impostor_id: instRows[0]?.impostor_participant_id ? Number(instRows[0].impostor_participant_id) : null,
        group_won: instRows[0]?.group_won == null ? null : Boolean(instRows[0].group_won),
    });
});

/**
 * Rating: get up to 3 other groups' finished dishes to nominate for awards
 */
export const getOtherDishes = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.params;
    const participant_id = req.query.participant_id as string | undefined;
    if (!participant_id) throw new AppError('participant_id is required', 400);

    const dishes = await getOtherDishesService(group_id, participant_id);
    return successResponse(res, 'Other dishes loaded', { dishes });
});

/**
 * Rating: nominate another group's dish for an award category
 */
export const submitRatingHandler = asyncHandler(async (req: Request, res: Response) => {
    const { instance_id, participant_id, rated_group_id, category_id } = req.body;
    if (!instance_id || !participant_id || !rated_group_id || !category_id) {
        throw new AppError('instance_id, participant_id, rated_group_id, and category_id are required', 400);
    }

    const data = await getInstanceById(instance_id);
    if (!data) throw new AppError('Cook & Create instance not found', 404);
    if (data.instance.status !== 'completed') {
        throw new AppError('You can rate other kitchens once your own game has finished', 400);
    }
    if (Number(rated_group_id) === data.instance.group_id) {
        throw new AppError('You cannot rate your own group', 400);
    }

    await submitRating(instance_id, participant_id, rated_group_id, category_id);
    return successResponse(res, 'Rating submitted', {});
});

/**
 * Final Results / Leaderboard: award board + this group's impostor reveal
 */
export const getAwardsHandler = asyncHandler(async (req: Request, res: Response) => {
    const { group_id } = req.params;
    const board = await getAwards(group_id);
    if (!board) throw new AppError('Group not found', 404);
    return successResponse(res, 'Awards loaded', board);
});

/**
 * Admin: List CC templates
 */
export const listCCTemplates = asyncHandler(async (_req: Request, res: Response) => {
    const [rows] = await query(`SELECT * FROM cc_game_templates ORDER BY id DESC`);
    return successResponse(res, 'Cook & Create templates', { templates: rows });
});

/**
 * Admin: Get CC template with ingredients
 */
export const getCCTemplateDetails = asyncHandler(async (req: Request, res: Response) => {
    const { template_id } = req.params;
    const [tplRows] = await query(`SELECT * FROM cc_game_templates WHERE id = ?`, [template_id]);
    if (tplRows.length === 0) {
        throw new AppError('Template not found', 404);
    }
    const [ingRows] = await query(
        `SELECT i.*, ti.order FROM cc_game_template_ingredients ti JOIN cc_ingredients i ON ti.ingredient_id = i.id WHERE ti.template_id = ? ORDER BY ti.order ASC`,
        [template_id]
    );
    const [clueRows] = await query(
        `SELECT * FROM cc_clues WHERE template_id = ? ORDER BY round_number, order ASC`,
        [template_id]
    );
    return successResponse(res, 'Template details', {
        template: tplRows[0],
        ingredients: ingRows,
        clues: clueRows,
    });
});

/**
 * Admin: Create or update a CC template
 */
export const saveCCTemplate = asyncHandler(async (req: Request, res: Response) => {
    const {
        id, activity_game_id, name, tagline, description,
        round1_ingredients_count, round1_votes_per_player, round1_top_ingredients,
        round1_timer_secs, round2_step_max_chars, round2_submit_timer_secs, round2_review_timer_secs,
        round3_discussion_timer_secs, round3_voting_timer_secs, round3_max_messages_per_player,
        show_host_role_enabled, impostor_bias_card_text, status,
        ingredients, clues,
    } = req.body;

    let templateId = id;

    if (templateId) {
        await query(
            `UPDATE cc_game_templates SET
                activity_game_id = ?, name = ?, tagline = ?, description = ?,
                round1_ingredients_count = ?, round1_votes_per_player = ?, round1_top_ingredients = ?,
                round1_timer_secs = ?, round2_step_max_chars = ?, round2_submit_timer_secs = ?, round2_review_timer_secs = ?,
                round3_discussion_timer_secs = ?, round3_voting_timer_secs = ?, round3_max_messages_per_player = ?,
                show_host_role_enabled = ?, impostor_bias_card_text = ?, status = ?, updated_at = NOW()
             WHERE id = ?`,
            [
                activity_game_id, name, tagline, description,
                round1_ingredients_count, round1_votes_per_player, round1_top_ingredients,
                round1_timer_secs, round2_step_max_chars, round2_submit_timer_secs, round2_review_timer_secs,
                round3_discussion_timer_secs, round3_voting_timer_secs, round3_max_messages_per_player,
                show_host_role_enabled ? 1 : 0, impostor_bias_card_text, status || 'active',
                templateId,
            ]
        );
        // Delete existing ingredients & clues
        await query(`DELETE FROM cc_game_template_ingredients WHERE template_id = ?`, [templateId]);
        await query(`DELETE FROM cc_clues WHERE template_id = ?`, [templateId]);
    } else {
        const [result] = await query(
            `INSERT INTO cc_game_templates (
                activity_game_id, name, tagline, description,
                round1_ingredients_count, round1_votes_per_player, round1_top_ingredients,
                round1_timer_secs, round2_step_max_chars, round2_submit_timer_secs, round2_review_timer_secs,
                round3_discussion_timer_secs, round3_voting_timer_secs, round3_max_messages_per_player,
                show_host_role_enabled, impostor_bias_card_text, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                activity_game_id, name, tagline, description,
                round1_ingredients_count, round1_votes_per_player, round1_top_ingredients,
                round1_timer_secs, round2_step_max_chars, round2_submit_timer_secs, round2_review_timer_secs,
                round3_discussion_timer_secs, round3_voting_timer_secs, round3_max_messages_per_player,
                show_host_role_enabled ? 1 : 0, impostor_bias_card_text, status || 'active',
            ]
        );
        templateId = Number((result as any).insertId);
    }

    // Re-insert ingredients
    if (Array.isArray(ingredients)) {
        const values = ingredients.map((ing: any, i: number) => [templateId, Number(ing.ingredient_id || ing.id), Number(ing.order || i)]);
        if (values.length > 0) {
            await query(
                `INSERT INTO cc_game_template_ingredients (template_id, ingredient_id, \`order\`) VALUES ?`,
                // @ts-ignore
                [values]
            );
        }
    }
    // Re-insert clues
    if (Array.isArray(clues)) {
        const values = clues.map((clue: any) => [templateId, Number(clue.round_number), String(clue.clue_text), Number(clue.order || 0)]);
        if (values.length > 0) {
            await query(
                `INSERT INTO cc_clues (template_id, round_number, clue_text, \`order\`) VALUES ?`,
                // @ts-ignore
                [values]
            );
        }
    }

    return successResponse(res, 'Template saved successfully', { template_id: templateId });
});

/**
 * Admin: List and Manage CC Ingredients
 */
export const listCCIngredients = asyncHandler(async (_req: Request, res: Response) => {
    const [rows] = await query(`SELECT * FROM cc_ingredients ORDER BY id ASC`);
    return successResponse(res, 'Cook & Create ingredients', { ingredients: rows });
});

export const saveCCIngredient = asyncHandler(async (req: Request, res: Response) => {
    const { id, name, image_url, is_absurd, activity_id, status } = req.body;
    if (!name) {
        throw new AppError('Ingredient name is required', 400);
    }
    if (id) {
        await query(
            `UPDATE cc_ingredients SET name = ?, image_url = ?, is_absurd = ?, activity_id = ?, status = ?, updated_at = NOW() WHERE id = ?`,
            [name, image_url || null, is_absurd ? 1 : 0, activity_id || 2, status || 'active', id]
        );
    } else {
        const [result] = await query(
            `INSERT INTO cc_ingredients (name, image_url, is_absurd, activity_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [name, image_url || null, is_absurd ? 1 : 0, activity_id || 2, status || 'active']
        );
        return successResponse(res, 'Ingredient created', { id: Number((result as any).insertId) });
    }
    return successResponse(res, 'Ingredient updated', { id });
});

export const deleteCCIngredient = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await query(`DELETE FROM cc_ingredients WHERE id = ?`, [id]);
    return successResponse(res, 'Ingredient deleted', {});
});
