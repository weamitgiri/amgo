import { Request, Response, NextFunction } from 'express';
/**
 * Attaches the organizer to the request when a valid token is present, and
 * otherwise lets the request through unauthenticated.
 *
 * Exists for the payment callbacks. Checkout is reachable by a first-time
 * registrant who has verified an OTP but never received a JWT (registration
 * hands back only an organizer id), so those routes cannot demand a bearer
 * token — the Razorpay signature is what proves the payment, and the token,
 * when present, only tightens an ownership check on top of it.
 */
export declare const optionalAuthMiddleware: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
