import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { ensureOrganizerStatusColumns } from '../utils/schemaHelpers';
import { errorResponse } from '../utils/apiResponse';
import { getJwtSecret } from '../utils/jwtSecret';

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
export const optionalAuthMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], getJwtSecret());
        (req as any).user = decoded;
    } catch {
        // An expired or malformed token is treated as no token rather than a
        // hard failure — the payment must still be verifiable.
    }

    return next();
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 'Authentication required', [], 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        const organizerId = (decoded as any).id;

        await ensureOrganizerStatusColumns();
        const [rows] = await query(
            'SELECT status, payment_status, account_status FROM organizers WHERE id = ? AND deleted_at IS NULL',
            [organizerId]
        );

        if (rows.length === 0) {
            return errorResponse(res, 'Organizer not found', [], 401);
        }

        const organizer = rows[0] as any;
        // Payment is no longer required to authenticate. An unpaid-but-verified
        // organizer reaches the dashboard, which prompts her to complete payment
        // and activate her package. Only a hard-suspended account (admin set
        // `status` to something other than 'active') is blocked here; deactivated
        // accounts are already excluded by the `deleted_at IS NULL` filter above.
        if (organizer.status && organizer.status !== 'active') {
            return errorResponse(res, 'Your account is not active. Please contact support.', [], 403);
        }

        (req as any).user = {
            ...(decoded as any),
            payment_status: organizer.payment_status,
            account_status: organizer.account_status,
        };
        next();
    } catch (error) {
        return errorResponse(res, 'Invalid or expired token', [], 401);
    }
};
