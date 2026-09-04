import { Request, Response } from 'express';
/**
 * Get Cook & Create game state for a group + current participant
 * (includes roles, round status, ingredients, votes, steps, messages etc.)
 */
export declare const getCCGameState: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 1: Submit ingredient votes
 */
export declare const submitRound1Votes: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 1: Finalize results (all players voted or timer ended)
 */
/**
 * Manual/organizer-triggered fallback — the normal path is automatic, either
 * via checkRound1Completion (everyone voted) or the cc_round1 timer expiry
 * (timerService.ts). finalizeRound1 is idempotent, so calling this when the
 * round has already advanced is a safe no-op.
 */
export declare const finalizeRound1Results: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 2: Submit cooking step
 */
export declare const submitRound2Step: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 2: Submit keep/remove vote for a step
 */
export declare const submitRound2StepVote: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 2: Save dish name (show host or first to submit)
 */
/**
 * Per the game design, once the review phase resolves everyone can see the
 * final 4 steps; the Show Host has the exclusive right to name the dish (if
 * the Show Host role is enabled for this template and one was assigned —
 * otherwise anyone may, matching the original first-submit-wins behavior).
 */
export declare const submitDishName: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 3: Send chat message
 */
export declare const submitRound3Message: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 3: Start voting phase
 */
/**
 * Manual/organizer-triggered fallback — normally discussion -> voting is
 * timer-driven (cc_round3_discussion expiry, timerService.ts).
 * advanceRound3ToVoting is idempotent, so this is a safe no-op if the round
 * has already moved on.
 */
export declare const startRound3Voting: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 3: Submit impostor vote
 */
export declare const submitRound3ImpostorVote: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 3: respond to the private "Double Down" offer (Accept doubles this
 * participant's vote weight but risks -50 points if their target is wrong;
 * Decline leaves their vote at normal weight with no risk).
 */
export declare const respondToDoubleDownHandler: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 3: End voting & reveal. Manual/organizer-triggered fallback — the
 * normal path is automatic (checkRound3VotingCompletion or the cc_round3_voting
 * timer). finalizeRound3 is idempotent, so a redundant call is a safe no-op.
 */
export declare const finalizeRound3Results: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Rating: get up to 3 other groups' finished dishes to nominate for awards
 */
export declare const getOtherDishes: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Rating: nominate another group's dish for an award category
 */
export declare const submitRatingHandler: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Final Results / Leaderboard: award board + this group's impostor reveal
 */
export declare const getAwardsHandler: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Admin: List CC templates
 */
export declare const listCCTemplates: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Admin: Get CC template with ingredients
 */
export declare const getCCTemplateDetails: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Admin: Create or update a CC template
 */
export declare const saveCCTemplate: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Admin: List and Manage CC Ingredients
 */
export declare const listCCIngredients: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const saveCCIngredient: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const deleteCCIngredient: (req: Request, res: Response, next: import("express").NextFunction) => void;
