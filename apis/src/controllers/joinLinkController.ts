import { Request, Response } from 'express';
import moment from 'moment';
import { query } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';

/**
 * Validate a join invitation link and return booking/activity details.
 */
export const getJoinLink = asyncHandler(async (req: Request, res: Response) => {
    const { link_token } = req.params;

    if (!link_token) {
        throw new AppError('Invitation link token is required', 400);
    }

    const [rows] = await query(
        `SELECT ob.id, ob.status, ob.game_id, ob.activity_id, ob.scheduled_date, ob.scheduled_time,
            a.title AS activity_title, a.slug AS activity_slug, a.description AS activity_description,
            a.lobby_wait_secs,
            o.name AS organizer_name, o.company_name AS organizer_company
         FROM organizer_bookings ob
         JOIN activities a ON ob.activity_id = a.id
         JOIN organizers o ON ob.organizer_id = o.id
         WHERE ob.invitation_link = ?`,
        [link_token]
    );

    if (rows.length === 0) {
        throw new AppError('Invalid invitation link', 404);
    }

    const booking = rows[0];

    if (booking.status === 'expired' || booking.status === 'cancelled') {
        throw new AppError('This invitation link is not active', 400);
    }

    if (!booking.scheduled_date || !booking.scheduled_time) {
        throw new AppError('Event schedule information is not available yet', 400);
    }

    const scheduledDate = moment(booking.scheduled_date).isValid()
        ? moment(booking.scheduled_date).format('YYYY-MM-DD')
        : String(booking.scheduled_date);
    const scheduledTime = moment(booking.scheduled_time, ['HH:mm:ss', 'HH:mm', moment.ISO_8601], true).isValid()
        ? moment(booking.scheduled_time, ['HH:mm:ss', 'HH:mm', moment.ISO_8601], true).format('HH:mm:ss')
        : String(booking.scheduled_time);

    const scheduleStart = moment(`${scheduledDate} ${scheduledTime}`, 'YYYY-MM-DD HH:mm:ss');
    if (!scheduleStart.isValid()) {
        throw new AppError('Event schedule information is invalid', 400);
    }

    // Entry window is admin-configurable per activity (activities.lobby_wait_secs).
    const lobbyWaitSecs = Number(booking.lobby_wait_secs) || 900;
    const joinWindowEnd = scheduleStart.clone().add(lobbyWaitSecs, 'seconds');
    const now = moment();
    const isPending = now.isBefore(scheduleStart);
    const isJoin = now.isSameOrAfter(scheduleStart) && now.isSameOrBefore(joinWindowEnd);
    const isExpired = now.isAfter(joinWindowEnd);

    if (isExpired) {
        throw new AppError(
            `Access Denied: You have joined after the allowed time. The session started at ${scheduleStart.format('h:mm A')} and entry was closed at ${joinWindowEnd.format('h:mm A')}. Please contact the Organiser for assistance.`,
            403
        );
    }

    await query('UPDATE organizer_bookings SET link_clicks = link_clicks + 1 WHERE id = ?', [booking.id]);

    return successResponse(res, 'Invitation link validated', {
        booking_id: booking.id,
        activity_id: booking.activity_id,
        activity_title: booking.activity_title,
        activity_slug: booking.activity_slug,
        activity_description: booking.activity_description,
        organizer_name: booking.organizer_name,
        organizer_company: booking.organizer_company,
        scheduled_date: booking.scheduled_date,
        scheduled_time: booking.scheduled_time,
        schedule_start: scheduleStart.toISOString(),
        join_window_ends_at: joinWindowEnd.toISOString(),
        is_pending: isPending,
        is_join: isJoin,
        is_active: !isPending && !isExpired,
    });
});
