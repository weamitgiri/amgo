import { Request, Response } from 'express';
export declare const registerOrganizer: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Organizer Login - Step 1: Send OTP
 */
export declare const organizerLogin: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Organizer Login - Step 2: Verify OTP & Return Token
 */
export declare const verifyLoginOtp: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Organizer Dashboard - Get Purchased Activities & Bookings
 */
export declare const getOrganizerDashboard: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Get Real-time Event Stats for Organizer Dashboard
 */
export declare const getEventStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const verifyOtp: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const resendOtp: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const createBooking: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getBookingDetails: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const completeBooking: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const confirmPayment: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const deactivateAccount: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Results tab — every completed/incomplete group across the organizer's
 * bookings, with results-PDF availability (PDFs live for 1 hour post-game).
 */
export declare const getOrganizerResults: (req: Request, res: Response, next: import("express").NextFunction) => void;
