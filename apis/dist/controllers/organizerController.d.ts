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
/**
 * Checkout entry point: captures billing details and starts payment.
 *
 * The two supported methods diverge in what this returns, not in how much of
 * the flow they share:
 *
 *   cod      -> booking is activated here and the invitation link is issued
 *               immediately, with the payment left `pending` for an admin to
 *               settle on collection.
 *   razorpay -> a local payment row and a Razorpay Order are created and the
 *               checkout parameters are returned. The booking stays
 *               `pending_activation` and no link is issued until the payment is
 *               verified server-side (or confirmed by webhook).
 *
 * Previously this wrote `payment_status = 'paid'` unconditionally with no
 * gateway involved at all.
 */
export declare const completeBooking: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const deactivateAccount: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * Results tab — every completed/incomplete group across the organizer's
 * bookings, with results-PDF availability (PDFs live for 1 hour post-game).
 */
export declare const getOrganizerResults: (req: Request, res: Response, next: import("express").NextFunction) => void;
