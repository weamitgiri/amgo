"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationsRead = exports.listNotifications = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const notificationService_1 = require("../services/notificationService");
exports.listNotifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const organizerId = req.user.id;
    const { booking_id } = req.params;
    const limit = req.query.limit != null ? Number(req.query.limit) : 20;
    const offset = req.query.offset != null ? Number(req.query.offset) : 0;
    await (0, notificationService_1.assertOrganizerBooking)(booking_id, organizerId);
    const result = await (0, notificationService_1.getNotifications)(booking_id, organizerId, { limit, offset });
    return (0, apiResponse_1.successResponse)(res, 'Notifications retrieved.', result);
});
exports.markNotificationsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const organizerId = req.user.id;
    const { booking_id } = req.params;
    await (0, notificationService_1.assertOrganizerBooking)(booking_id, organizerId);
    const marked = await (0, notificationService_1.markAllNotificationsRead)(booking_id, organizerId);
    const result = await (0, notificationService_1.getNotifications)(booking_id, organizerId, { limit: 20 });
    return (0, apiResponse_1.successResponse)(res, 'Notifications marked as read.', {
        marked,
        unread_count: result.unread_count,
    });
});
