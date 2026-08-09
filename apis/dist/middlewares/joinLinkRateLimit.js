"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinLinkRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/** Rate limit only join-link lookups (polled on the public join page). */
exports.joinLinkRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 2 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 2 minutes',
        errors: [],
    },
});
