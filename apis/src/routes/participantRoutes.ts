import { Router } from 'express';
import { body } from 'express-validator';
import * as participantController from '../controllers/participantController';
import * as joinLinkController from '../controllers/joinLinkController';
import { validateRequest } from '../middlewares/validateRequest';
import { joinLinkRateLimit } from '../middlewares/joinLinkRateLimit';

const router = Router();

// Verify invitation link
router.get('/verify-link/:link_token', participantController.verifyInvitation);
// Join link lookup — rate limited separately (2 min window)
router.get('/join_links/:link_token', joinLinkRateLimit, joinLinkController.getJoinLink);
router.get('/join-links/:link_token', joinLinkRateLimit, joinLinkController.getJoinLink);

// Step 1: Join with Name & Email
router.post(
    '/join',
    [
        body('booking_id').isNumeric().withMessage('Booking ID is required'),
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
    ],
    validateRequest,
    participantController.participantJoin
);

// Step 2: Verify OTP & Assign Group
router.post(
    '/verify-otp',
    [
        body('booking_id').isNumeric().withMessage('Booking ID is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    ],
    validateRequest,
    participantController.verifyParticipantOtp
);

// Get Lobby Information
router.get('/lobby/:group_id', participantController.getLobbyInfo);

// Case summary / game screen
router.get('/game-summary/:group_id', participantController.getGameSummary);

export default router;
