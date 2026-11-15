import { Request, Response } from 'express';
/**
 * Post-game results for a group. The game is over, so identities are no longer
 * secret — the reveal screen shows each player's real registered name alongside
 * their character and role (the PDF already does the same).
 */
export declare const getGameResults: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Downloads the results PDF. Available for exactly 1 hour after a group's game
 * ends, to either: the participant who was in the group (via participant_id query
 * param, matching the rest of the participant-facing API's auth-less pattern), or
 * the organizer who owns the booking (via their existing JWT).
 */
export declare const downloadResultsPdf: (req: Request, res: Response, next: import("express").NextFunction) => void;
