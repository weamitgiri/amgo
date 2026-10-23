import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as cookandcreateController from '../../controllers/cookandcreateController';
import { validateRequest } from '../../middlewares/validateRequest';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { participantAuth } from '../../middlewares/participantAuth';

const router = Router();

/* ---------------- Participant (Public/Game) Routes ---------------- */

// Get Cook & Create game state (lobby, rounds, everything) for a group
router.get(
    '/state/:group_id',
    participantAuth,
    [
        param('group_id').isNumeric().withMessage('group_id must be numeric'),
    ],
    validateRequest,
    cookandcreateController.getCCGameState
);

// Round 1: Submit ingredient votes
router.post(
    '/round1/vote',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('participant_id').isNumeric().withMessage('participant_id is required'),
        body('ingredient_ids').isArray({ min: 1 }).withMessage('ingredient_ids array is required'),
    ],
    validateRequest,
    cookandcreateController.submitRound1Votes
);

// Round 1: Finalize results (timer or all voted)
router.post(
    '/round1/finalize',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
    ],
    validateRequest,
    cookandcreateController.finalizeRound1Results
);

// Round 2: Submit cooking step
router.post(
    '/round2/submit-step',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('participant_id').isNumeric().withMessage('participant_id is required'),
        body('step_text').notEmpty().withMessage('step_text is required'),
        // step_letter is assigned server-side from the submitter's turn index —
        // see submitRound2Step. Anything the client sent is ignored.
    ],
    validateRequest,
    cookandcreateController.submitRound2Step
);

// Round 2: Vote to keep/remove a step
router.post(
    '/round2/vote-step',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('participant_id').isNumeric().withMessage('participant_id is required'),
        body('step_id').isNumeric().withMessage('step_id is required'),
        body('vote').isIn(['keep', 'remove']).withMessage('vote must be "keep" or "remove"'),
    ],
    validateRequest,
    cookandcreateController.submitRound2StepVote
);

// Round 2: Submit dish name
router.post(
    '/round2/submit-dish-name',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('dish_name').notEmpty().withMessage('dish_name is required'),
    ],
    validateRequest,
    cookandcreateController.submitDishName
);

// Round 3: Send chat message
router.post(
    '/round3/send-message',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('participant_id').isNumeric().withMessage('participant_id is required'),
        body('message').notEmpty().withMessage('message is required'),
    ],
    validateRequest,
    cookandcreateController.submitRound3Message
);

// Round 3: Start voting phase (after discussion)
router.post(
    '/round3/start-voting',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
    ],
    validateRequest,
    cookandcreateController.startRound3Voting
);

// Round 3: Submit impostor vote
router.post(
    '/round3/vote-impostor',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('participant_id').isNumeric().withMessage('participant_id is required'),
        body('voted_for_participant_id').isNumeric().withMessage('voted_for_participant_id is required'),
    ],
    validateRequest,
    cookandcreateController.submitRound3ImpostorVote
);

// Round 3: respond to the private Double Down offer
router.post(
    '/round3/double-down',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('participant_id').isNumeric().withMessage('participant_id is required'),
        body('accept').isBoolean().withMessage('accept must be a boolean'),
    ],
    validateRequest,
    cookandcreateController.respondToDoubleDownHandler
);

// Round 3: Finalize reveal
router.post(
    '/round3/finalize',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
    ],
    validateRequest,
    cookandcreateController.finalizeRound3Results
);

// Rating: up to 3 other groups' finished dishes to nominate for awards
router.get(
    '/:group_id/other-dishes',
    participantAuth,
    [
        param('group_id').isNumeric().withMessage('group_id must be numeric'),
    ],
    validateRequest,
    cookandcreateController.getOtherDishes
);

// Rating: review another group's dish — ONE atomic submission carrying both a
// 1–5 star rating and an emoji reaction (both required); once-only per dish.
router.post(
    '/rate',
    participantAuth,
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('participant_id').isNumeric().withMessage('participant_id is required'),
        body('rated_group_id').isNumeric().withMessage('rated_group_id is required'),
        body('category_id').isNumeric().withMessage('category_id is required'),
        body('stars').isInt({ min: 1, max: 5 }).withMessage('stars must be a whole number from 1 to 5'),
    ],
    validateRequest,
    cookandcreateController.submitRatingHandler
);

// Final Results / Leaderboard: award board + this group's impostor reveal.
// Gated — the requester must pass their participant_id and have completed every
// required review (enforced in the handler).
router.get(
    '/:group_id/awards',
    participantAuth,
    [
        param('group_id').isNumeric().withMessage('group_id must be numeric'),
        query('participant_id').isNumeric().withMessage('participant_id is required'),
    ],
    validateRequest,
    cookandcreateController.getAwardsHandler
);

/* ---------------- Admin / Organizer Routes ---------------- */

// Admin: List templates
router.get(
    '/admin/templates',
    authMiddleware,
    cookandcreateController.listCCTemplates
);

// Admin: Get template details with ingredients & clues
router.get(
    '/admin/templates/:template_id',
    [
        param('template_id').isNumeric().withMessage('template_id must be numeric'),
    ],
    validateRequest,
    authMiddleware,
    cookandcreateController.getCCTemplateDetails
);

// Admin: Create or update a template
router.post(
    '/admin/templates',
    authMiddleware,
    cookandcreateController.saveCCTemplate
);

// Admin: List ingredients
router.get(
    '/admin/ingredients',
    authMiddleware,
    cookandcreateController.listCCIngredients
);

// Admin: Save ingredient (create or update)
router.post(
    '/admin/ingredients',
    authMiddleware,
    cookandcreateController.saveCCIngredient
);

// Admin: Delete ingredient
router.delete(
    '/admin/ingredients/:id',
    [
        param('id').isNumeric().withMessage('Ingredient id must be numeric'),
    ],
    validateRequest,
    authMiddleware,
    cookandcreateController.deleteCCIngredient
);

export default router;
