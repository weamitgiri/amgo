import rateLimit from 'express-rate-limit';

/** Rate limit only join-link lookups (polled on the public join page). */
export const joinLinkRateLimit = rateLimit({
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
