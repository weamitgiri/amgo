import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { ensureOrganizerStatusColumns } from '../utils/schemaHelpers';
import { errorResponse } from '../utils/apiResponse';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 'Authentication required', [], 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
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
        if (organizer.status !== 'active' || organizer.account_status !== 'active' || organizer.payment_status !== 'paid') {
            return errorResponse(res, 'Account is not active. Please complete payment to proceed.', [], 403);
        }

        (req as any).user = decoded;
        next();
    } catch (error) {
        return errorResponse(res, 'Invalid or expired token', [], 401);
    }
};
