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
const gameEngineController = __importStar(require("../controllers/gameEngineController"));
const validateRequest_1 = require("../middlewares/validateRequest");
const router = (0, express_1.Router)();
// Participants have no JWT (see participantController.ts's existing pattern) — every
// action below is scoped by group_id + the caller's own participant_id instead of
// an auth middleware.
// Get game state
router.get('/state/:group_id', gameEngineController.getGameState);
// Case Summary Reopen
router.post('/reopen-case-summary', [
    (0, express_validator_1.body)('group_id').notEmpty().withMessage('Group ID is required'),
    (0, express_validator_1.body)('participant_id').notEmpty().withMessage('participant_id is required'),
], validateRequest_1.validateRequest, gameEngineController.reopenCaseSummary);
// Questioning
router.post('/ask-question', [
    (0, express_validator_1.body)('group_id').notEmpty().withMessage('Group ID is required'),
    (0, express_validator_1.body)('participant_id').notEmpty().withMessage('participant_id is required'),
    (0, express_validator_1.body)('asked_to_session_id').notEmpty().withMessage('Target session ID is required'),
    (0, express_validator_1.body)('question_text').notEmpty().withMessage('Question text is required'),
], validateRequest_1.validateRequest, gameEngineController.askQuestion);
router.post('/answer-question', [
    (0, express_validator_1.body)('question_id').notEmpty().withMessage('Question ID is required'),
    (0, express_validator_1.body)('participant_id').notEmpty().withMessage('participant_id is required'),
    (0, express_validator_1.body)('answer_text').notEmpty().withMessage('Answer text is required'),
], validateRequest_1.validateRequest, gameEngineController.answerQuestion);
// Lie Detector
router.post('/start-lie-detector', [
    (0, express_validator_1.body)('group_id').notEmpty().withMessage('Group ID is required'),
    (0, express_validator_1.body)('participant_id').notEmpty().withMessage('participant_id is required'),
    (0, express_validator_1.body)('suspect_session_id').notEmpty().withMessage('Suspect session ID is required'),
], validateRequest_1.validateRequest, gameEngineController.startLieDetector);
router.post('/vote-lie-detector', [
    (0, express_validator_1.body)('group_id').notEmpty().withMessage('Group ID is required'),
    (0, express_validator_1.body)('participant_id').notEmpty().withMessage('participant_id is required'),
    (0, express_validator_1.body)('round_id').notEmpty().withMessage('Round ID is required'),
    (0, express_validator_1.body)('vote_value').isIn(['believable', 'suspicious']).withMessage('Invalid vote value'),
], validateRequest_1.validateRequest, gameEngineController.voteLieDetector);
router.get('/lie-detector/:round_id/tally', gameEngineController.getLieDetectorTally);
router.post('/end-lie-detector', [
    (0, express_validator_1.body)('group_id').notEmpty().withMessage('Group ID is required'),
    (0, express_validator_1.body)('participant_id').notEmpty().withMessage('participant_id is required'),
    (0, express_validator_1.body)('round_id').notEmpty().withMessage('Round ID is required'),
], validateRequest_1.validateRequest, gameEngineController.endLieDetectorRound);
// Witness Passcard
router.post('/use-passcard', [
    (0, express_validator_1.body)('group_id').notEmpty().withMessage('Group ID is required'),
    (0, express_validator_1.body)('participant_id').notEmpty().withMessage('participant_id is required'),
], validateRequest_1.validateRequest, gameEngineController.useWitnessPasscard);
// Final Accusation (any non-culprit role — see verdictScoringService.ts)
router.post('/submit-accusation', [
    (0, express_validator_1.body)('group_id').notEmpty().withMessage('Group ID is required'),
    (0, express_validator_1.body)('participant_id').notEmpty().withMessage('participant_id is required'),
    (0, express_validator_1.body)('accused_session_id').notEmpty().withMessage('Accused session ID is required'),
    (0, express_validator_1.body)('reasoning').notEmpty().withMessage('Reasoning is required'),
], validateRequest_1.validateRequest, gameEngineController.submitAccusation);
exports.default = router;
