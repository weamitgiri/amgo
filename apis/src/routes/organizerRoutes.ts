import { Router } from 'express';
import { body } from 'express-validator';
import * as organizerController from '../controllers/organizerController';
import * as profileController from '../controllers/profileController';
import * as notificationController from '../controllers/notificationController';
import { validateRequest } from '../middlewares/validateRequest';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Step 1: Basic Information & OTP Sending (Registration)
router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('company_name').notEmpty().withMessage('Company name is required'),
        body('company_website').notEmpty().withMessage('Company website is required'),
    ],
    validateRequest,
    organizerController.registerOrganizer
);

// Organizer Login - Step 1: Send OTP
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
    ],
    validateRequest,
    organizerController.organizerLogin
);

// Organizer Login - Step 2: Verify OTP
router.post(
    '/verify-login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    ],
    validateRequest,
    organizerController.verifyLoginOtp
);

// Organizer Dashboard (Protected)
router.get(
    '/dashboard',
    authMiddleware,
    organizerController.getOrganizerDashboard
);

// Organizer Profile (Protected)
router.get('/profile', authMiddleware, profileController.getProfile);
router.put(
    '/profile',
    authMiddleware,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('company_name').notEmpty().withMessage('Company name is required'),
    ],
    validateRequest,
    profileController.updateProfile
);
router.put(
    '/profile/billing',
    authMiddleware,
    [
        body('billing_address').notEmpty().withMessage('Billing address is required'),
        body('city').notEmpty().withMessage('City is required'),
        body('state').notEmpty().withMessage('State is required'),
        body('pin_code').notEmpty().withMessage('PIN code is required'),
    ],
    validateRequest,
    profileController.updateBilling
);

// Real-time Event Stats (Protected)
router.get(
    '/event-stats/:booking_id',
    authMiddleware,
    organizerController.getEventStats
);

// Organizer notifications (Protected)
router.get(
    '/notifications/:booking_id',
    authMiddleware,
    notificationController.listNotifications
);
router.post(
    '/notifications/:booking_id/read-all',
    authMiddleware,
    notificationController.markNotificationsRead
);

// Step 2: Email Verification (Registration)
router.post(
    '/verify-otp',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    ],
    validateRequest,
    organizerController.verifyOtp
);

// Resend OTP
router.post(
    '/resend-otp',
    [
        body('email').isEmail().withMessage('Valid email is required'),
    ],
    validateRequest,
    organizerController.resendOtp
);

// Step 3: Activity Selection & Booking Creation
router.post(
    '/create-booking',
    [
        body('organizer_id').isNumeric().withMessage('Organizer ID must be numeric'),
        body('activity_id').isNumeric().withMessage('Activity ID must be numeric'),
        body('game_id').isNumeric().withMessage('Game ID must be numeric'),
        body('package_id').isNumeric().withMessage('Package ID must be numeric'),
        body('scheduled_date').isISO8601().withMessage('Valid date is required'),
        body('scheduled_time').notEmpty().withMessage('Time is required'),
    ],
    validateRequest,
    organizerController.createBooking
);

// Review Information
router.get(
    '/booking/:booking_id',
    organizerController.getBookingDetails
);

// Step 4: Final Details & Payment Confirmation
router.post(
    '/complete-booking',
    [
        body('booking_id').isNumeric().withMessage('Booking ID must be numeric'),
        body('billing_address').notEmpty().withMessage('Billing address is required'),
        body('city').notEmpty().withMessage('City is required'),
        body('state').notEmpty().withMessage('State is required'),
        body('pin_code').notEmpty().withMessage('Pincode is required'),
        body('payment_method').notEmpty().withMessage('Payment method is required'),
        body('consents').isObject().withMessage('Consents must be an object'),
        body('consents.authorization').isBoolean().equals('true').withMessage('Authorization is required'),
        body('consents.participant_consent').isBoolean().equals('true').withMessage('Participant consent is required'),
        body('consents.terms_accepted').isBoolean().equals('true').withMessage('Terms acceptance is required'),
        body('consents.non_refundable_accepted').isBoolean().equals('true').withMessage('Non-refundable policy acceptance is required'),
        body('consents.validity_accepted').isBoolean().equals('true').withMessage('Booking validity acceptance is required'),
    ],
    validateRequest,
    organizerController.completeBooking
);

// Update Session Date/Time (One-time only)
router.post(
    '/update-session',
    [
        body('booking_id').isNumeric().withMessage('Booking ID must be numeric'),
        body('scheduled_date').isISO8601().withMessage('Valid date is required'),
        body('scheduled_time').notEmpty().withMessage('Time is required'),
    ],
    validateRequest,
    organizerController.updateSession
);

export default router;
