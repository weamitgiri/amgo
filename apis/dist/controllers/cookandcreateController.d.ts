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
export declare const submitDishName: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 3: Send chat message
 */
export declare const submitRound3Message: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 3: Start voting phase
 */
export declare const startRound3Voting: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 3: Submit impostor vote
 */
export declare const submitRound3ImpostorVote: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Round 3: End voting & reveal
 */
export declare const finalizeRound3Results: (req: Request, res: Response, next: import("express").NextFunction) => void;
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
