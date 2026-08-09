"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCCIngredients = getCCIngredients;
exports.getCCTemplateByGameId = getCCTemplateByGameId;
exports.getOrCreateCCInstance = getOrCreateCCInstance;
exports.assignCCRoles = assignCCRoles;
exports.saveRound1Votes = saveRound1Votes;
exports.calculateRound1Results = calculateRound1Results;
exports.saveRound2Step = saveRound2Step;
exports.saveRound2StepVote = saveRound2StepVote;
exports.saveRound3Message = saveRound3Message;
exports.saveRound3ImpostorVote = saveRound3ImpostorVote;
exports.getCCRatingCategories = getCCRatingCategories;
const db_1 = require("../config/db");
const moment_1 = __importDefault(require("moment"));
/**
 * Get default ingredients for Cook & Create activity
 */
async function getCCIngredients(activityId = 2) {
    const [rows] = await (0, db_1.query)(`SELECT id, name, image_url, is_absurd FROM cc_ingredients WHERE activity_id = ? AND status = 'active' ORDER BY id ASC`, [activityId]);
    return rows.map((r) => ({
        id: Number(r.id),
        name: r.name,
        image_url: r.image_url,
        is_absurd: Boolean(r.is_absurd),
    }));
}
/**
 * Get template by activity_game_id
 */
async function getCCTemplateByGameId(activityGameId) {
    const [rows] = await (0, db_1.query)(`SELECT * FROM cc_game_templates WHERE activity_game_id = ? AND status = 'active' LIMIT 1`, [activityGameId]);
    if (rows.length === 0)
        return null;
    const r = rows[0];
    return {
        id: Number(r.id),
        activity_game_id: Number(r.activity_game_id),
        name: r.name,
        tagline: r.tagline,
        description: r.description,
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
 * Get or create cook & create game instance for a group
 */
async function getOrCreateCCInstance(groupId, activityGameId) {
    let resolvedActivityGameId = activityGameId;
    if (!resolvedActivityGameId) {
        // Get default activity_game_id for cook&create (slug cook-and-create)
        const [agRows] = await (0, db_1.query)(`SELECT ag.id FROM activity_games ag JOIN activities a ON ag.activity_id = a.id WHERE a.slug = 'cook-and-create' LIMIT 1`);
        if (agRows.length === 0)
            return null;
        resolvedActivityGameId = agRows[0].id;
    }
    const template = await getCCTemplateByGameId(resolvedActivityGameId);
    if (!template)
        return null;
    let [rows] = await (0, db_1.query)(`SELECT * FROM cc_game_instances WHERE group_id = ?`, [groupId]);
    if (rows.length === 0) {
        await (0, db_1.query)(`INSERT INTO cc_game_instances (group_id, template_id, activity_id, status, created_at, updated_at) VALUES (?, ?, 2, 'waiting', NOW(), NOW())`, [groupId, template.id]);
        [rows] = await (0, db_1.query)(`SELECT * FROM cc_game_instances WHERE group_id = ?`, [groupId]);
    }
    const r = rows[0];
    return {
        instance: {
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
        },
        template,
    };
}
/**
 * Assign random roles (impostor, show host, chefs) to participants
 */
async function assignCCRoles(instanceId, participantIds) {
    if (participantIds.length === 0)
        return { impostorId: null, showHostId: null };
    // Shuffle array
    const shuffled = [...participantIds].sort(() => Math.random() - 0.5);
    // First = Impostor (always)
    const impostorId = shuffled[0];
    // If show host enabled and participants >=4: second = show host
    let showHostId = null;
    const [instanceRows] = await (0, db_1.query)(`SELECT t.show_host_role_enabled FROM cc_game_instances i JOIN cc_game_templates t ON i.template_id = t.id WHERE i.id = ?`, [instanceId]);
    const showHostEnabled = instanceRows.length > 0 && Boolean(instanceRows[0].show_host_role_enabled);
    if (showHostEnabled && shuffled.length >= 4) {
        showHostId = shuffled[1];
    }
    await (0, db_1.query)(`UPDATE cc_game_instances SET impostor_participant_id = ?, show_host_participant_id = ?, status = 'round1', round1_started_at = ?, updated_at = NOW() WHERE id = ?`, [impostorId, showHostId, (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss'), instanceId]);
    return { impostorId, showHostId };
}
/**
 * Save ingredient votes for round 1
 */
async function saveRound1Votes(instanceId, participantId, ingredientIds) {
    // Delete existing votes first
    await (0, db_1.query)(`DELETE FROM cc_round1_votes WHERE instance_id = ? AND participant_id = ?`, [instanceId, participantId]);
    const values = ingredientIds.map((ingId) => [instanceId, participantId, ingId, (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss')]);
    if (values.length > 0) {
        await (0, db_1.query)(`INSERT INTO cc_round1_votes (instance_id, participant_id, ingredient_id, created_at) VALUES ?`, 
        // @ts-ignore
        [values]);
    }
    return true;
}
/**
 * Calculate round 1 results and save top N ingredients
 */
async function calculateRound1Results(instanceId, topCount) {
    const [votes] = await (0, db_1.query)(`SELECT ingredient_id, COUNT(*) as c FROM cc_round1_votes WHERE instance_id = ? GROUP BY ingredient_id ORDER BY c DESC, ingredient_id ASC`, [instanceId]);
    const results = votes.map((v) => ({ ingredientId: Number(v.ingredient_id), count: Number(v.c) })).slice(0, topCount);
    // Delete existing selected ingredients for this instance
    await (0, db_1.query)(`DELETE FROM cc_round1_selected_ingredients WHERE instance_id = ?`, [instanceId]);
    const values = results.map((r, i) => [instanceId, r.ingredientId, r.count, i + 1]);
    if (values.length > 0) {
        await (0, db_1.query)(`INSERT INTO cc_round1_selected_ingredients (instance_id, ingredient_id, vote_count, \`rank\`) VALUES ?`, 
        // @ts-ignore
        [values]);
    }
    return results;
}
/**
 * Save a cooking step for round 2
 */
async function saveRound2Step(instanceId, participantId, stepText, stepLetter) {
    const [existing] = await (0, db_1.query)(`SELECT id FROM cc_round2_steps WHERE instance_id = ? AND participant_id = ?`, [instanceId, participantId]);
    let stepId;
    if (existing.length > 0) {
        await (0, db_1.query)(`UPDATE cc_round2_steps SET step_text = ? WHERE id = ?`, [stepText, existing[0].id]);
        stepId = Number(existing[0].id);
    }
    else {
        const [res] = await (0, db_1.query)(`INSERT INTO cc_round2_steps (instance_id, participant_id, step_text, step_letter, created_at) VALUES (?, ?, ?, ?, NOW())`, [instanceId, participantId, stepText, stepLetter]);
        stepId = Number(res.insertId);
    }
    return stepId;
}
/**
 * Save a keep/remove vote for a step
 */
async function saveRound2StepVote(instanceId, participantId, stepId, vote) {
    await (0, db_1.query)(`INSERT INTO cc_round2_step_votes (instance_id, participant_id, step_id, vote, created_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE vote = VALUES(vote)`, [instanceId, participantId, stepId, vote]);
    return true;
}
/**
 * Save a chat message for round 3
 */
async function saveRound3Message(instanceId, participantId, message, isImpostorPrivate = false) {
    const [res] = await (0, db_1.query)(`INSERT INTO cc_round3_messages (instance_id, participant_id, message, is_impostor_private, created_at) VALUES (?, ?, ?, ?, NOW())`, [instanceId, participantId, message, isImpostorPrivate ? 1 : 0]);
    return Number(res.insertId);
}
/**
 * Save an impostor vote for round 3
 */
async function saveRound3ImpostorVote(instanceId, participantId, votedForId) {
    await (0, db_1.query)(`INSERT INTO cc_round3_impostor_votes (instance_id, participant_id, voted_for_participant_id, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE voted_for_participant_id = VALUES(voted_for_participant_id)`, [instanceId, participantId, votedForId]);
}
/**
 * Get rating categories
 */
async function getCCRatingCategories() {
    const [rows] = await (0, db_1.query)(`SELECT id, name, slug, emoji, description FROM cc_rating_categories WHERE status = 'active' ORDER BY \`order\` ASC`);
    return rows.map((r) => ({
        id: Number(r.id),
        name: r.name,
        slug: r.slug,
        emoji: r.emoji,
        description: r.description,
    }));
}
