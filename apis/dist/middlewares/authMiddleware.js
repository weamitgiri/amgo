"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const schemaHelpers_1 = require("../utils/schemaHelpers");
const apiResponse_1 = require("../utils/apiResponse");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return (0, apiResponse_1.errorResponse)(res, 'Authentication required', [], 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        const organizerId = decoded.id;
        await (0, schemaHelpers_1.ensureOrganizerStatusColumns)();
        const [rows] = await (0, db_1.query)('SELECT status, payment_status, account_status FROM organizers WHERE id = ? AND deleted_at IS NULL', [organizerId]);
        if (rows.length === 0) {
            return (0, apiResponse_1.errorResponse)(res, 'Organizer not found', [], 401);
        }
        const organizer = rows[0];
        // Payment is no longer required to authenticate. An unpaid-but-verified
        // organizer reaches the dashboard, which prompts her to complete payment
        // and activate her package. Only a hard-suspended account (admin set
        // `status` to something other than 'active') is blocked here; deactivated
        // accounts are already excluded by the `deleted_at IS NULL` filter above.
        if (organizer.status && organizer.status !== 'active') {
            return (0, apiResponse_1.errorResponse)(res, 'Your account is not active. Please contact support.', [], 403);
        }
        req.user = {
            ...decoded,
            payment_status: organizer.payment_status,
            account_status: organizer.account_status,
        };
        next();
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Invalid or expired token', [], 401);
    }
};
exports.authMiddleware = authMiddleware;
