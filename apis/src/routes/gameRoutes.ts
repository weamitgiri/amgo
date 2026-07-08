import { Router } from 'express';
import { body } from 'express-validator';
import * as gameEngineController from '../controllers/gameEngineController';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

// Participants have no JWT (see participantController.ts's existing pattern) — every
// action below is scoped by group_id + the caller's own participant_id instead of
// an auth middleware.

// Get game state
router.get('/state/:group_id', gameEngineController.getGameState);

// Case Summary Reopen
router.post(
    '/reopen-case-summary',
    [
        body('group_id').notEmpty().withMessage('Group ID is required'),
        body('participant_id').notEmpty().withMessage('participant_id is required'),
    ],
    validateRequest,
    gameEngineController.reopenCaseSummary
);

// Questioning
router.post(
    '/ask-question',
    [
        body('group_id').notEmpty().withMessage('Group ID is required'),
        body('participant_id').notEmpty().withMessage('participant_id is required'),
        body('asked_to_session_id').notEmpty().withMessage('Target session ID is required'),
        body('question_text').notEmpty().withMessage('Question text is required'),
    ],
    validateRequest,
    gameEngineController.askQuestion
);

router.post(
    '/answer-question',
    [
        body('question_id').notEmpty().withMessage('Question ID is required'),
        body('participant_id').notEmpty().withMessage('participant_id is required'),
        body('answer_text').notEmpty().withMessage('Answer text is required'),
    ],
    validateRequest,
    gameEngineController.answerQuestion
);

// Lie Detector
router.post(
    '/start-lie-detector',
    [
        body('group_id').notEmpty().withMessage('Group ID is required'),
        body('participant_id').notEmpty().withMessage('participant_id is required'),
        body('suspect_session_id').notEmpty().withMessage('Suspect session ID is required'),
    ],
    validateRequest,
    gameEngineController.startLieDetector
);

router.post(
    '/vote-lie-detector',
    [
        body('group_id').notEmpty().withMessage('Group ID is required'),
        body('participant_id').notEmpty().withMessage('participant_id is required'),
        body('round_id').notEmpty().withMessage('Round ID is required'),
        body('vote_value').isIn(['believable', 'suspicious']).withMessage('Invalid vote value'),
    ],
    validateRequest,
    gameEngineController.voteLieDetector
);

router.get('/lie-detector/:round_id/tally', gameEngineController.getLieDetectorTally);

router.post(
    '/end-lie-detector',
    [
        body('group_id').notEmpty().withMessage('Group ID is required'),
        body('participant_id').notEmpty().withMessage('participant_id is required'),
        body('round_id').notEmpty().withMessage('Round ID is required'),
    ],
    validateRequest,
    gameEngineController.endLieDetectorRound
);

// Witness Passcard
router.post(
    '/use-passcard',
    [
        body('group_id').notEmpty().withMessage('Group ID is required'),
        body('participant_id').notEmpty().withMessage('participant_id is required'),
    ],
    validateRequest,
    gameEngineController.useWitnessPasscard
);

// Final Accusation (any non-culprit role — see verdictScoringService.ts)
router.post(
    '/submit-accusation',
    [
        body('group_id').notEmpty().withMessage('Group ID is required'),
        body('participant_id').notEmpty().withMessage('participant_id is required'),
        body('accused_session_id').notEmpty().withMessage('Accused session ID is required'),
        body('reasoning').notEmpty().withMessage('Reasoning is required'),
    ],
    validateRequest,
    gameEngineController.submitAccusation
);

export default router;
