/**
 * Game Engine Controller
 *
 * Core logic for the Detective Mystery game mechanics.
 * Handles phase-specific actions:
 * 1. Questioning Phase (Investigator vs Suspects).
 * 2. Lie Detector Phase (Voting and Truth-seeking).
 * 3. Case Summary management (Investigator's reopen power).
 * 4. Final accusations and result computation (see verdictScoringService.ts).
 *
 * Participants are not organizer-authenticated (they have no JWT) — every action
 * here is scoped by `group_id` + the participant's own `participant_id`, the same
 * identification pattern already used by participantController.ts's
 * getLobbyInfo/getGameSummary endpoints.
 */
import { Request, Response } from 'express';
/**
 * Get Current Game State
 * Hydrates the frontend with all group data, timers, and active questions.
 */
export declare const getGameState: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Investigator Asks a Question
 * Enforces the "Max N questions total" rule (activity-configurable, default 5).
 * Awards +10 points to the Investigator immediately, and starts a per-question
 * response timer so a non-answer auto-skips with a penalty (see timerService.ts).
 */
export declare const askQuestion: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Participant Answers a Question
 * Enforces the response-timer rule (activity-configurable, default 2 minutes).
 * Deducts the configured no-response penalty if the answer is late.
 */
export declare const answerQuestion: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Submit Final Accusation
 * Any non-culprit role (Investigator, Suspect, Witness, Participant) may submit
 * exactly one accusation. Once all eligible roles have submitted (or the
 * questioning timer independently expires), the verdict is finalized and scored —
 * see verdictScoringService.finalizeVerdict.
 */
export declare const submitAccusation: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Start Lie Detector Round
 * Investigator-only, once per game.
 */
export declare const startLieDetector: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Vote in Lie Detector — one vote per participant per answer, tallied in real time.
 */
export declare const voteLieDetector: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getLieDetectorTally: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Ends the active Lie Detector round (Investigator-only) and transitions the group
 * back to the normal questioning phase. Also triggered automatically by
 * timerService.ts when the round's timer expires.
 */
export declare const endLieDetectorRound: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Use Witness Passcard
 */
export declare const useWitnessPasscard: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Reopen Case Summary — Investigator-only, once per game.
 */
export declare const reopenCaseSummary: (req: Request, res: Response, next: import("express").NextFunction) => void;
