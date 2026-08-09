import { Router } from 'express';
import { body, param } from 'express-validator';
import * as cookandcreateController from '../../controllers/cookandcreateController';
import { validateRequest } from '../../middlewares/validateRequest';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();

/* ---------------- Participant (Public/Game) Routes ---------------- */

// Get Cook & Create game state (lobby, rounds, everything) for a group
router.get(
    '/state/:group_id',
    [
        param('group_id').isNumeric().withMessage('group_id must be numeric'),
    ],
    validateRequest,
    cookandcreateController.getCCGameState
);

// Round 1: Submit ingredient votes
router.post(
    '/round1/vote',
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
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
    ],
    validateRequest,
    cookandcreateController.finalizeRound1Results
);

// Round 2: Submit cooking step
router.post(
    '/round2/submit-step',
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('participant_id').isNumeric().withMessage('participant_id is required'),
        body('step_text').notEmpty().withMessage('step_text is required'),
        body('step_letter').notEmpty().withMessage('step_letter is required (A, B, C...)'),
    ],
    validateRequest,
    cookandcreateController.submitRound2Step
);

// Round 2: Vote to keep/remove a step
router.post(
    '/round2/vote-step',
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
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
    ],
    validateRequest,
    cookandcreateController.startRound3Voting
);

// Round 3: Submit impostor vote
router.post(
    '/round3/vote-impostor',
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('participant_id').isNumeric().withMessage('participant_id is required'),
        body('voted_for_participant_id').isNumeric().withMessage('voted_for_participant_id is required'),
    ],
    validateRequest,
    cookandcreateController.submitRound3ImpostorVote
);

// Round 3: Finalize reveal
router.post(
    '/round3/finalize',
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
    ],
    validateRequest,
    cookandcreateController.finalizeRound3Results
);

// Rating: up to 3 other groups' finished dishes to nominate for awards
router.get(
    '/:group_id/other-dishes',
    [
        param('group_id').isNumeric().withMessage('group_id must be numeric'),
    ],
    validateRequest,
    cookandcreateController.getOtherDishes
);

// Rating: nominate another group's dish for an award category
router.post(
    '/rate',
    [
        body('instance_id').isNumeric().withMessage('instance_id is required'),
        body('participant_id').isNumeric().withMessage('participant_id is required'),
        body('rated_group_id').isNumeric().withMessage('rated_group_id is required'),
        body('category_id').isNumeric().withMessage('category_id is required'),
    ],
    validateRequest,
    cookandcreateController.submitRatingHandler
);

// Final Results / Leaderboard: award board + this group's impostor reveal
router.get(
    '/:group_id/awards',
    [
        param('group_id').isNumeric().withMessage('group_id must be numeric'),
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
