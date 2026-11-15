"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const cookandcreateController = __importStar(require("../../controllers/cookandcreateController"));
const validateRequest_1 = require("../../middlewares/validateRequest");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const participantAuth_1 = require("../../middlewares/participantAuth");
const router = (0, express_1.Router)();
/* ---------------- Participant (Public/Game) Routes ---------------- */
// Get Cook & Create game state (lobby, rounds, everything) for a group
router.get('/state/:group_id', participantAuth_1.participantAuth, [
    (0, express_validator_1.param)('group_id').isNumeric().withMessage('group_id must be numeric'),
], validateRequest_1.validateRequest, cookandcreateController.getCCGameState);
// Round 1: Submit ingredient votes
router.post('/round1/vote', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
    (0, express_validator_1.body)('participant_id').isNumeric().withMessage('participant_id is required'),
    (0, express_validator_1.body)('ingredient_ids').isArray({ min: 1 }).withMessage('ingredient_ids array is required'),
], validateRequest_1.validateRequest, cookandcreateController.submitRound1Votes);
// Round 1: Finalize results (timer or all voted)
router.post('/round1/finalize', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
], validateRequest_1.validateRequest, cookandcreateController.finalizeRound1Results);
// Round 2: Submit cooking step
router.post('/round2/submit-step', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
    (0, express_validator_1.body)('participant_id').isNumeric().withMessage('participant_id is required'),
    (0, express_validator_1.body)('step_text').notEmpty().withMessage('step_text is required'),
    // step_letter is assigned server-side from the submitter's turn index —
    // see submitRound2Step. Anything the client sent is ignored.
], validateRequest_1.validateRequest, cookandcreateController.submitRound2Step);
// Round 2: Vote to keep/remove a step
router.post('/round2/vote-step', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
    (0, express_validator_1.body)('participant_id').isNumeric().withMessage('participant_id is required'),
    (0, express_validator_1.body)('step_id').isNumeric().withMessage('step_id is required'),
    (0, express_validator_1.body)('vote').isIn(['keep', 'remove']).withMessage('vote must be "keep" or "remove"'),
], validateRequest_1.validateRequest, cookandcreateController.submitRound2StepVote);
// Round 2: Submit dish name
router.post('/round2/submit-dish-name', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
    (0, express_validator_1.body)('dish_name').notEmpty().withMessage('dish_name is required'),
], validateRequest_1.validateRequest, cookandcreateController.submitDishName);
// Round 3: Send chat message
router.post('/round3/send-message', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
    (0, express_validator_1.body)('participant_id').isNumeric().withMessage('participant_id is required'),
    (0, express_validator_1.body)('message').notEmpty().withMessage('message is required'),
], validateRequest_1.validateRequest, cookandcreateController.submitRound3Message);
// Round 3: Start voting phase (after discussion)
router.post('/round3/start-voting', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
], validateRequest_1.validateRequest, cookandcreateController.startRound3Voting);
// Round 3: Submit impostor vote
router.post('/round3/vote-impostor', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
    (0, express_validator_1.body)('participant_id').isNumeric().withMessage('participant_id is required'),
    (0, express_validator_1.body)('voted_for_participant_id').isNumeric().withMessage('voted_for_participant_id is required'),
], validateRequest_1.validateRequest, cookandcreateController.submitRound3ImpostorVote);
// Round 3: respond to the private Double Down offer
router.post('/round3/double-down', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
    (0, express_validator_1.body)('participant_id').isNumeric().withMessage('participant_id is required'),
    (0, express_validator_1.body)('accept').isBoolean().withMessage('accept must be a boolean'),
], validateRequest_1.validateRequest, cookandcreateController.respondToDoubleDownHandler);
// Round 3: Finalize reveal
router.post('/round3/finalize', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
], validateRequest_1.validateRequest, cookandcreateController.finalizeRound3Results);
// Rating: up to 3 other groups' finished dishes to nominate for awards
router.get('/:group_id/other-dishes', participantAuth_1.participantAuth, [
    (0, express_validator_1.param)('group_id').isNumeric().withMessage('group_id must be numeric'),
], validateRequest_1.validateRequest, cookandcreateController.getOtherDishes);
// Rating: review another group's dish — ONE atomic submission carrying both a
// 1–5 star rating and an emoji reaction (both required); once-only per dish.
router.post('/rate', participantAuth_1.participantAuth, [
    (0, express_validator_1.body)('instance_id').isNumeric().withMessage('instance_id is required'),
    (0, express_validator_1.body)('participant_id').isNumeric().withMessage('participant_id is required'),
    (0, express_validator_1.body)('rated_group_id').isNumeric().withMessage('rated_group_id is required'),
    (0, express_validator_1.body)('category_id').isNumeric().withMessage('category_id is required'),
    (0, express_validator_1.body)('stars').isInt({ min: 1, max: 5 }).withMessage('stars must be a whole number from 1 to 5'),
], validateRequest_1.validateRequest, cookandcreateController.submitRatingHandler);
// Final Results / Leaderboard: award board + this group's impostor reveal.
// Gated — the requester must pass their participant_id and have completed every
// required review (enforced in the handler).
router.get('/:group_id/awards', participantAuth_1.participantAuth, [
    (0, express_validator_1.param)('group_id').isNumeric().withMessage('group_id must be numeric'),
    (0, express_validator_1.query)('participant_id').isNumeric().withMessage('participant_id is required'),
], validateRequest_1.validateRequest, cookandcreateController.getAwardsHandler);
/* ---------------- Admin / Organizer Routes ---------------- */
// Admin: List templates
router.get('/admin/templates', authMiddleware_1.authMiddleware, cookandcreateController.listCCTemplates);
// Admin: Get template details with ingredients & clues
router.get('/admin/templates/:template_id', [
    (0, express_validator_1.param)('template_id').isNumeric().withMessage('template_id must be numeric'),
], validateRequest_1.validateRequest, authMiddleware_1.authMiddleware, cookandcreateController.getCCTemplateDetails);
// Admin: Create or update a template
router.post('/admin/templates', authMiddleware_1.authMiddleware, cookandcreateController.saveCCTemplate);
// Admin: List ingredients
router.get('/admin/ingredients', authMiddleware_1.authMiddleware, cookandcreateController.listCCIngredients);
// Admin: Save ingredient (create or update)
router.post('/admin/ingredients', authMiddleware_1.authMiddleware, cookandcreateController.saveCCIngredient);
// Admin: Delete ingredient
router.delete('/admin/ingredients/:id', [
    (0, express_validator_1.param)('id').isNumeric().withMessage('Ingredient id must be numeric'),
], validateRequest_1.validateRequest, authMiddleware_1.authMiddleware, cookandcreateController.deleteCCIngredient);
exports.default = router;
