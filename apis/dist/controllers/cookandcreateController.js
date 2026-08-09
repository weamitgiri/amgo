"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCCIngredient = exports.saveCCIngredient = exports.listCCIngredients = exports.saveCCTemplate = exports.getCCTemplateDetails = exports.listCCTemplates = exports.finalizeRound3Results = exports.submitRound3ImpostorVote = exports.startRound3Voting = exports.submitRound3Message = exports.submitDishName = exports.submitRound2StepVote = exports.submitRound2Step = exports.finalizeRound1Results = exports.submitRound1Votes = exports.getCCGameState = void 0;
const db_1 = require("../config/db");
const apiResponse_1 = require("../utils/apiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const AppError_1 = require("../utils/AppError");
const cookandcreateService_1 = require("../services/cookandcreateService");
const pseudonym_1 = require("../utils/pseudonym");
/**
 * Get Cook & Create game state for a group + current participant
 * (includes roles, round status, ingredients, votes, steps, messages etc.)
 */
exports.getCCGameState = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { group_id } = req.params;
    const participant_id = req.query.participant_id;
    const myParticipantId = participant_id ? Number(participant_id) : null;
    // Get group + booking + activity/game info
    const [groupRows] = await (0, db_1.query)(`SELECT gg.id, gg.booking_id, gg.game_id, ob.activity_id, ob.game_id as booking_game_id, a.slug AS activity_slug
         FROM game_groups gg
         JOIN organizer_bookings ob ON gg.booking_id = ob.id
         JOIN activities a ON ob.activity_id = a.id
         WHERE gg.id = ?`, [group_id]);
    if (groupRows.length === 0) {
        throw new AppError_1.AppError('Group not found', 404);
    }
    const group = groupRows[0];
    // Get or create CC instance
    const ccData = await (0, cookandcreateService_1.getOrCreateCCInstance)(group_id, group.game_id || group.booking_game_id);
    if (!ccData) {
        throw new AppError_1.AppError('Cook & Create game template not found', 404);
    }
    const { instance, template } = ccData;
    // Get participants in group
    const [participantRows] = await (0, db_1.query)(`SELECT id, name, status, COALESCE(email_verified_at, created_at) AS joined_at
         FROM game_participants WHERE group_id = ? ORDER BY joined_at ASC`, [group_id]);
    const participants = participantRows.map((p) => ({
        id: Number(p.id),
        name: myParticipantId === Number(p.id) ? p.name : (0, pseudonym_1.shortName)(p.name, Number(p.id)),
        isYou: myParticipantId === Number(p.id),
        status: p.status,
    }));
    const participantIds = participants.map((p) => p.id);
    // Auto-start if we have enough participants and status is waiting
    if (instance.status === 'waiting' && participants.length >= (Number(template.round1_top_ingredients) || 4)) {
        const roles = await (0, cookandcreateService_1.assignCCRoles)(instance.id, participantIds);
        instance.impostor_participant_id = roles.impostorId;
        instance.show_host_participant_id = roles.showHostId;
        instance.status = 'round1';
    }
    // Get default CC ingredients
    const allIngredients = await (0, cookandcreateService_1.getCCIngredients)(group.activity_id || 2);
    // Get my ingredient votes
    let myIngredientVotes = [];
    if (myParticipantId) {
        const [myVotes] = await (0, db_1.query)(`SELECT ingredient_id FROM cc_round1_votes WHERE instance_id = ? AND participant_id = ?`, [instance.id, myParticipantId]);
        myIngredientVotes = myVotes.map((v) => Number(v.ingredient_id));
    }
    // Get total ingredient vote counts (group-level)
    const [groupIngredientVotes] = await (0, db_1.query)(`SELECT ingredient_id, COUNT(*) as vote_count FROM cc_round1_votes WHERE instance_id = ? GROUP BY ingredient_id`, [instance.id]);
    const ingredientVoteMap = new Map();
    groupIngredientVotes.forEach((g) => ingredientVoteMap.set(Number(g.ingredient_id), Number(g.vote_count)));
    // Get Round 1 selected top ingredients
    const [selectedIngredientsRows] = await (0, db_1.query)(`SELECT i.id, i.name, i.image_url, i.is_absurd, s.vote_count, s.rank
         FROM cc_round1_selected_ingredients s
         JOIN cc_ingredients i ON s.ingredient_id = i.id
         WHERE s.instance_id = ? ORDER BY s.rank ASC`, [instance.id]);
    const selectedIngredients = selectedIngredientsRows.map((r) => ({
        id: Number(r.id),
        name: r.name,
        image_url: r.image_url,
        is_absurd: Boolean(r.is_absurd),
        vote_count: Number(r.vote_count),
        rank: Number(r.rank),
    }));
    // Round 2: cooking steps
    let cookingSteps = [];
    let myCookingStep = null;
    if (instance.status === 'round2' || selectedIngredients.length > 0) {
        const [stepsRows] = await (0, db_1.query)(`SELECT s.id, s.step_letter, s.step_text, s.status,
                    (SELECT COUNT(*) FROM cc_round2_step_votes sv WHERE sv.step_id = s.id AND sv.vote = 'keep') as keep_votes,
                    (SELECT COUNT(*) FROM cc_round2_step_votes sv WHERE sv.step_id = s.id AND sv.vote = 'remove') as remove_votes,
                    s.participant_id
             FROM cc_round2_steps s WHERE s.instance_id = ? ORDER BY s.step_letter ASC`, [instance.id]);
        cookingSteps = stepsRows.map((s) => {
            const participant = participants.find((p) => p.id === Number(s.participant_id));
            return {
                id: Number(s.id),
                letter: s.step_letter,
                text: s.step_text,
                status: s.status,
                keep_votes: Number(s.keep_votes),
                remove_votes: Number(s.remove_votes),
                // Never expose who submitted which step (anonymous)
                submitted_by_name: participant ? participant.name : null,
            };
        });
        if (myParticipantId) {
            const myStep = stepsRows.find((s) => Number(s.participant_id) === myParticipantId);
            myCookingStep = myStep ? myStep.step_text : null;
        }
    }
    // My step votes
    let myStepVotes = {};
    if (myParticipantId && cookingSteps.length > 0) {
        const [myVotes] = await (0, db_1.query)(`SELECT step_id, vote FROM cc_round2_step_votes WHERE instance_id = ? AND participant_id = ?`, [instance.id, myParticipantId]);
        myVotes.forEach((v) => (myStepVotes[Number(v.step_id)] = v.vote));
    }
    // Round 3: Chat messages & votes
    // Only show non-private messages publicly, and private messages only to the impostor
    let chatMessages = [];
    let myImpostorVote = null;
    if (instance.status === 'round3_discussion' || instance.status === 'round3_voting' || instance.status === 'completed') {
        const isImpostor = myParticipantId === instance.impostor_participant_id;
        const queryText = isImpostor
            ? `SELECT id, participant_id, message, is_impostor_private, created_at FROM cc_round3_messages WHERE instance_id = ? ORDER BY created_at ASC`
            : `SELECT id, participant_id, message, is_impostor_private, created_at FROM cc_round3_messages WHERE instance_id = ? AND is_impostor_private = 0 ORDER BY created_at ASC`;
        const [msgRows] = await (0, db_1.query)(queryText, [instance.id]);
        chatMessages = msgRows.map((m) => {
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
            const [voteRow] = await (0, db_1.query)(`SELECT voted_for_participant_id FROM cc_round3_impostor_votes WHERE instance_id = ? AND participant_id = ?`, [instance.id, myParticipantId]);
            if (voteRow.length > 0) {
                myImpostorVote = Number(voteRow[0].voted_for_participant_id);
            }
        }
    }
    // Total votes per participant (for round 3 live counter, anonymous)
    const [impostorVoteCountsRows] = await (0, db_1.query)(`SELECT voted_for_participant_id, COUNT(*) as vote_count FROM cc_round3_impostor_votes WHERE instance_id = ? GROUP BY voted_for_participant_id`, [instance.id]);
    const impostorVoteCounts = impostorVoteCountsRows.map((v) => ({
        voted_for_participant_id: Number(v.voted_for_participant_id),
        count: Number(v.vote_count),
    }));
    // Rating categories
    const ratingCategories = await (0, cookandcreateService_1.getCCRatingCategories)();
    // Role for current user
    let myRole = null;
    let myRoleLabel = null;
    let isImpostor = false;
    let isShowHost = false;
    if (myParticipantId) {
        if (myParticipantId === instance.impostor_participant_id) {
            isImpostor = true;
            myRole = 'impostor';
            myRoleLabel = 'The Impostor';
        }
        else if (myParticipantId === instance.show_host_participant_id) {
            isShowHost = true;
            myRole = 'show_host';
            myRoleLabel = 'Show Host';
        }
        else {
            myRole = 'chef';
            // Assign a Chef number based on participant order
            const chefIndex = participants
                .filter((p) => p.id !== instance.impostor_participant_id && p.id !== instance.show_host_participant_id)
                .findIndex((p) => p.id === myParticipantId);
            myRoleLabel = chefIndex >= 0 ? `Chef ${chefIndex + 1}` : 'Chef';
        }
    }
    // Round 2 released clues
    const [clueRows] = await (0, db_1.query)(`SELECT c.id, c.clue_text, c.round_number FROM cc_round2_released_clues rc JOIN cc_clues c ON rc.clue_id = c.id WHERE rc.instance_id = ?`, [instance.id]);
    const releasedClues = clueRows.map((r) => ({ id: Number(r.id), text: r.clue_text, round_number: Number(r.round_number) }));
    // Success response
    return (0, apiResponse_1.successResponse)(res, 'Cook & Create state loaded', {
        instance: {
            ...instance,
        },
        template,
        participants,
        my_participant: myParticipantId
            ? participants.find((p) => p.id === myParticipantId) || null
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
        released_clues: releasedClues,
        // Round 3
        chat_messages: chatMessages,
        my_impostor_vote: myImpostorVote,
        impostor_vote_counts: impostorVoteCounts,
        // Ratings
        rating_categories: ratingCategories,
        // Dish name
        dish_name: instance.dish_name,
    });
});
/**
 * Round 1: Submit ingredient votes
 */
exports.submitRound1Votes = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { instance_id, participant_id, ingredient_ids } = req.body;
    if (!instance_id || !participant_id || !Array.isArray(ingredient_ids)) {
        throw new AppError_1.AppError('instance_id, participant_id, and ingredient_ids (array) are required', 400);
    }
    await (0, cookandcreateService_1.saveRound1Votes)(instance_id, participant_id, ingredient_ids);
    // Emit socket event for real-time update
    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-group-${req.params.group_id || instance_id}`).emit('cc_round1_vote_submitted', { participant_id, ingredient_ids });
        }
    }
    catch (_e) {
        /* ignore */
    }
    return (0, apiResponse_1.successResponse)(res, 'Votes submitted successfully', {});
});
/**
 * Round 1: Finalize results (all players voted or timer ended)
 */
exports.finalizeRound1Results = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { instance_id, top_count } = req.body;
    if (!instance_id) {
        throw new AppError_1.AppError('instance_id is required', 400);
    }
    const results = await (0, cookandcreateService_1.calculateRound1Results)(instance_id, top_count || 4);
    // Move instance to round2
    await (0, db_1.query)(`UPDATE cc_game_instances SET status = 'round2', round1_ended_at = NOW(), round2_started_at = NOW(), updated_at = NOW() WHERE id = ?`, [instance_id]);
    // Socket event
    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_round1_complete', { top_ingredients: results });
        }
    }
    catch (_e) {
        /* ignore */
    }
    return (0, apiResponse_1.successResponse)(res, 'Round 1 complete', { top_ingredients: results });
});
/**
 * Round 2: Submit cooking step
 */
exports.submitRound2Step = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { instance_id, participant_id, step_text, step_letter } = req.body;
    if (!instance_id || !participant_id || !step_text || !step_letter) {
        throw new AppError_1.AppError('instance_id, participant_id, step_text, and step_letter are required', 400);
    }
    const stepId = await (0, cookandcreateService_1.saveRound2Step)(instance_id, participant_id, step_text, step_letter);
    // Socket event
    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_round2_step_submitted', { step_id: stepId, participant_id });
        }
    }
    catch (_e) {
        /* ignore */
    }
    return (0, apiResponse_1.successResponse)(res, 'Step submitted successfully', { step_id: stepId });
});
/**
 * Round 2: Submit keep/remove vote for a step
 */
exports.submitRound2StepVote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { instance_id, participant_id, step_id, vote } = req.body;
    if (!instance_id || !participant_id || !step_id || (vote !== 'keep' && vote !== 'remove')) {
        throw new AppError_1.AppError('instance_id, participant_id, step_id, and vote (keep/remove) are required', 400);
    }
    await (0, cookandcreateService_1.saveRound2StepVote)(instance_id, participant_id, step_id, vote);
    return (0, apiResponse_1.successResponse)(res, 'Vote submitted successfully', {});
});
/**
 * Round 2: Save dish name (show host or first to submit)
 */
exports.submitDishName = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { instance_id, participant_id, dish_name } = req.body;
    if (!instance_id || !dish_name) {
        throw new AppError_1.AppError('instance_id and dish_name are required', 400);
    }
    await (0, db_1.query)(`UPDATE cc_game_instances SET dish_name = ?, dish_named_by_participant_id = ?, updated_at = NOW() WHERE id = ? AND dish_name IS NULL`, [dish_name, participant_id || null, instance_id]);
    // Move to round3_discussion
    await (0, db_1.query)(`UPDATE cc_game_instances SET status = 'round3_discussion', round2_ended_at = NOW(), round3_discussion_started_at = NOW(), updated_at = NOW() WHERE id = ?`, [instance_id]);
    // Socket event
    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_dish_name_submitted', { dish_name });
            io.to(`cc-instance-${instance_id}`).emit('cc_round3_discussion_started', {});
        }
    }
    catch (_e) {
        /* ignore */
    }
    return (0, apiResponse_1.successResponse)(res, 'Dish name saved', { dish_name });
});
/**
 * Round 3: Send chat message
 */
exports.submitRound3Message = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { instance_id, participant_id, message, is_impostor_private } = req.body;
    if (!instance_id || !participant_id || !message) {
        throw new AppError_1.AppError('instance_id, participant_id, and message are required', 400);
    }
    const msgId = await (0, cookandcreateService_1.saveRound3Message)(instance_id, participant_id, message, Boolean(is_impostor_private));
    // Socket event
    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_round3_message_new', { id: msgId, instance_id, participant_id, message, is_impostor_private });
        }
    }
    catch (_e) {
        /* ignore */
    }
    return (0, apiResponse_1.successResponse)(res, 'Message sent', { message_id: msgId });
});
/**
 * Round 3: Start voting phase
 */
exports.startRound3Voting = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { instance_id } = req.body;
    if (!instance_id) {
        throw new AppError_1.AppError('instance_id is required', 400);
    }
    await (0, db_1.query)(`UPDATE cc_game_instances SET status = 'round3_voting', round3_discussion_ended_at = NOW(), round3_voting_started_at = NOW(), updated_at = NOW() WHERE id = ?`, [instance_id]);
    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_round3_voting_started', {});
        }
    }
    catch (_e) {
        /* ignore */
    }
    return (0, apiResponse_1.successResponse)(res, 'Round 3 voting phase started', {});
});
/**
 * Round 3: Submit impostor vote
 */
exports.submitRound3ImpostorVote = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { instance_id, participant_id, voted_for_participant_id } = req.body;
    if (!instance_id || !participant_id || !voted_for_participant_id) {
        throw new AppError_1.AppError('instance_id, participant_id, and voted_for_participant_id are required', 400);
    }
    await (0, cookandcreateService_1.saveRound3ImpostorVote)(instance_id, participant_id, voted_for_participant_id);
    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_round3_impostor_vote_submitted', { participant_id, voted_for_participant_id });
        }
    }
    catch (_e) {
        /* ignore */
    }
    return (0, apiResponse_1.successResponse)(res, 'Vote submitted', {});
});
/**
 * Round 3: End voting & reveal
 */
exports.finalizeRound3Results = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { instance_id } = req.body;
    if (!instance_id) {
        throw new AppError_1.AppError('instance_id is required', 400);
    }
    // Find the participant with most votes
    const [voteRows] = await (0, db_1.query)(`SELECT voted_for_participant_id, COUNT(*) AS vote_count
         FROM cc_round3_impostor_votes WHERE instance_id = ?
         GROUP BY voted_for_participant_id ORDER BY vote_count DESC LIMIT 1`, [instance_id]);
    const mostVotedId = voteRows.length > 0 ? Number(voteRows[0].voted_for_participant_id) : null;
    // Get instance impostor
    const [instRows] = await (0, db_1.query)(`SELECT impostor_participant_id FROM cc_game_instances WHERE id = ?`, [instance_id]);
    const actualImpostorId = instRows.length > 0 ? Number(instRows[0].impostor_participant_id) : null;
    const group_won = mostVotedId != null && actualImpostorId != null && mostVotedId === actualImpostorId;
    await (0, db_1.query)(`UPDATE cc_game_instances SET status = 'completed', round3_voting_ended_at = NOW(), finished_at = NOW(), group_won = ?, updated_at = NOW() WHERE id = ?`, [group_won ? 1 : 0, instance_id]);
    try {
        const { io } = require('../server');
        if (io) {
            io.to(`cc-instance-${instance_id}`).emit('cc_round3_complete', {
                most_voted_id: mostVotedId,
                actual_impostor_id: actualImpostorId,
                group_won,
            });
        }
    }
    catch (_e) {
        /* ignore */
    }
    return (0, apiResponse_1.successResponse)(res, 'Round 3 finalized', {
        most_voted_id: mostVotedId,
        actual_impostor_id: actualImpostorId,
        group_won,
    });
});
/**
 * Admin: List CC templates
 */
exports.listCCTemplates = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [rows] = await (0, db_1.query)(`SELECT * FROM cc_game_templates ORDER BY id DESC`);
    return (0, apiResponse_1.successResponse)(res, 'Cook & Create templates', { templates: rows });
});
/**
 * Admin: Get CC template with ingredients
 */
exports.getCCTemplateDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { template_id } = req.params;
    const [tplRows] = await (0, db_1.query)(`SELECT * FROM cc_game_templates WHERE id = ?`, [template_id]);
    if (tplRows.length === 0) {
        throw new AppError_1.AppError('Template not found', 404);
    }
    const [ingRows] = await (0, db_1.query)(`SELECT i.*, ti.order FROM cc_game_template_ingredients ti JOIN cc_ingredients i ON ti.ingredient_id = i.id WHERE ti.template_id = ? ORDER BY ti.order ASC`, [template_id]);
    const [clueRows] = await (0, db_1.query)(`SELECT * FROM cc_clues WHERE template_id = ? ORDER BY round_number, order ASC`, [template_id]);
    return (0, apiResponse_1.successResponse)(res, 'Template details', {
        template: tplRows[0],
        ingredients: ingRows,
        clues: clueRows,
    });
});
/**
 * Admin: Create or update a CC template
 */
exports.saveCCTemplate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id, activity_game_id, name, tagline, description, round1_ingredients_count, round1_votes_per_player, round1_top_ingredients, round1_timer_secs, round2_step_max_chars, round2_submit_timer_secs, round2_review_timer_secs, round3_discussion_timer_secs, round3_voting_timer_secs, round3_max_messages_per_player, show_host_role_enabled, impostor_bias_card_text, status, ingredients, clues, } = req.body;
    let templateId = id;
    if (templateId) {
        await (0, db_1.query)(`UPDATE cc_game_templates SET
                activity_game_id = ?, name = ?, tagline = ?, description = ?,
                round1_ingredients_count = ?, round1_votes_per_player = ?, round1_top_ingredients = ?,
                round1_timer_secs = ?, round2_step_max_chars = ?, round2_submit_timer_secs = ?, round2_review_timer_secs = ?,
                round3_discussion_timer_secs = ?, round3_voting_timer_secs = ?, round3_max_messages_per_player = ?,
                show_host_role_enabled = ?, impostor_bias_card_text = ?, status = ?, updated_at = NOW()
             WHERE id = ?`, [
            activity_game_id, name, tagline, description,
            round1_ingredients_count, round1_votes_per_player, round1_top_ingredients,
            round1_timer_secs, round2_step_max_chars, round2_submit_timer_secs, round2_review_timer_secs,
            round3_discussion_timer_secs, round3_voting_timer_secs, round3_max_messages_per_player,
            show_host_role_enabled ? 1 : 0, impostor_bias_card_text, status || 'active',
            templateId,
        ]);
        // Delete existing ingredients & clues
        await (0, db_1.query)(`DELETE FROM cc_game_template_ingredients WHERE template_id = ?`, [templateId]);
        await (0, db_1.query)(`DELETE FROM cc_clues WHERE template_id = ?`, [templateId]);
    }
    else {
        const [result] = await (0, db_1.query)(`INSERT INTO cc_game_templates (
                activity_game_id, name, tagline, description,
                round1_ingredients_count, round1_votes_per_player, round1_top_ingredients,
                round1_timer_secs, round2_step_max_chars, round2_submit_timer_secs, round2_review_timer_secs,
                round3_discussion_timer_secs, round3_voting_timer_secs, round3_max_messages_per_player,
                show_host_role_enabled, impostor_bias_card_text, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
            activity_game_id, name, tagline, description,
            round1_ingredients_count, round1_votes_per_player, round1_top_ingredients,
            round1_timer_secs, round2_step_max_chars, round2_submit_timer_secs, round2_review_timer_secs,
            round3_discussion_timer_secs, round3_voting_timer_secs, round3_max_messages_per_player,
            show_host_role_enabled ? 1 : 0, impostor_bias_card_text, status || 'active',
        ]);
        templateId = Number(result.insertId);
    }
    // Re-insert ingredients
    if (Array.isArray(ingredients)) {
        const values = ingredients.map((ing, i) => [templateId, Number(ing.ingredient_id || ing.id), Number(ing.order || i)]);
        if (values.length > 0) {
            await (0, db_1.query)(`INSERT INTO cc_game_template_ingredients (template_id, ingredient_id, \`order\`) VALUES ?`, 
            // @ts-ignore
            [values]);
        }
    }
    // Re-insert clues
    if (Array.isArray(clues)) {
        const values = clues.map((clue) => [templateId, Number(clue.round_number), String(clue.clue_text), Number(clue.order || 0)]);
        if (values.length > 0) {
            await (0, db_1.query)(`INSERT INTO cc_clues (template_id, round_number, clue_text, \`order\`) VALUES ?`, 
            // @ts-ignore
            [values]);
        }
    }
    return (0, apiResponse_1.successResponse)(res, 'Template saved successfully', { template_id: templateId });
});
/**
 * Admin: List and Manage CC Ingredients
 */
exports.listCCIngredients = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [rows] = await (0, db_1.query)(`SELECT * FROM cc_ingredients ORDER BY id ASC`);
    return (0, apiResponse_1.successResponse)(res, 'Cook & Create ingredients', { ingredients: rows });
});
exports.saveCCIngredient = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id, name, image_url, is_absurd, activity_id, status } = req.body;
    if (!name) {
        throw new AppError_1.AppError('Ingredient name is required', 400);
    }
    if (id) {
        await (0, db_1.query)(`UPDATE cc_ingredients SET name = ?, image_url = ?, is_absurd = ?, activity_id = ?, status = ?, updated_at = NOW() WHERE id = ?`, [name, image_url || null, is_absurd ? 1 : 0, activity_id || 2, status || 'active', id]);
    }
    else {
        const [result] = await (0, db_1.query)(`INSERT INTO cc_ingredients (name, image_url, is_absurd, activity_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`, [name, image_url || null, is_absurd ? 1 : 0, activity_id || 2, status || 'active']);
        return (0, apiResponse_1.successResponse)(res, 'Ingredient created', { id: Number(result.insertId) });
    }
    return (0, apiResponse_1.successResponse)(res, 'Ingredient updated', { id });
});
exports.deleteCCIngredient = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await (0, db_1.query)(`DELETE FROM cc_ingredients WHERE id = ?`, [id]);
    return (0, apiResponse_1.successResponse)(res, 'Ingredient deleted', {});
});
