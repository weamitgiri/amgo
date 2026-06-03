import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import {
    assertOrganizerBooking,
    getNotifications,
    markAllNotificationsRead,
} from '../services/notificationService';

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
    const organizerId = (req as any).user.id;
    const { booking_id } = req.params;
    const limit = req.query.limit != null ? Number(req.query.limit) : 20;
    const offset = req.query.offset != null ? Number(req.query.offset) : 0;

    await assertOrganizerBooking(booking_id, organizerId);

    const result = await getNotifications(booking_id, organizerId, { limit, offset });
    return successResponse(res, 'Notifications retrieved.', result);
});

export const markNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
    const organizerId = (req as any).user.id;
    const { booking_id } = req.params;

    await assertOrganizerBooking(booking_id, organizerId);

    const marked = await markAllNotificationsRead(booking_id, organizerId);
    const result = await getNotifications(booking_id, organizerId, { limit: 20 });

    return successResponse(res, 'Notifications marked as read.', {
        marked,
        unread_count: result.unread_count,
    });
});
