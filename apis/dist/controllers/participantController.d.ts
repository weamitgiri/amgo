import { Request, Response } from 'express';
/**
 * Verify Invitation Link and Get Booking Info
 * Increments link click counter
 */
export declare const verifyInvitation: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Participant Join - Step 1: Submit Name & Email
 */
export declare const participantJoin: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Participant Step 2: Verify OTP and Assign Group
 */
export declare const verifyParticipantOtp: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get Lobby Info
 */
export declare const getLobbyInfo: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Case summary / game page data (activity settings + game content from admin)
 */
export declare const getGameSummary: (req: Request, res: Response, next: import("express").NextFunction) => void;
