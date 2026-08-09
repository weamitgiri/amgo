"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const organizerController = __importStar(require("../controllers/organizerController"));
const profileController = __importStar(require("../controllers/profileController"));
const notificationController = __importStar(require("../controllers/notificationController"));
const validateRequest_1 = require("../middlewares/validateRequest");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const INDIAN_STATES_AND_UTS = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Lakshadweep', 'Puducherry'
];
const router = (0, express_1.Router)();
// Step 1: Basic Information & OTP Sending (Registration)
router.post('/register', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('company_name').notEmpty().withMessage('Company name is required'),
    (0, express_validator_1.body)('company_website').notEmpty().withMessage('Company website is required'),
], validateRequest_1.validateRequest, organizerController.registerOrganizer);
// Organizer Login - Step 1: Send OTP
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
], validateRequest_1.validateRequest, organizerController.organizerLogin);
// Organizer Login - Step 2: Verify OTP
router.post('/verify-login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], validateRequest_1.validateRequest, organizerController.verifyLoginOtp);
// Organizer Dashboard (Protected)
router.get('/dashboard', authMiddleware_1.authMiddleware, organizerController.getOrganizerDashboard);
// Organizer Profile (Protected)
router.get('/profile', authMiddleware_1.authMiddleware, profileController.getProfile);
router.put('/profile', authMiddleware_1.authMiddleware, [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('company_name').notEmpty().withMessage('Company name is required'),
], validateRequest_1.validateRequest, profileController.updateProfile);
router.put('/profile/billing', authMiddleware_1.authMiddleware, [
    (0, express_validator_1.body)('gst_number')
        .notEmpty().withMessage('GST number is required')
        .isLength({ min: 15, max: 15 }).withMessage('GST number must be 15 characters')
        .matches(/^[0-9A-Za-z]{15}$/).withMessage('GST number must contain only letters and numbers'),
    (0, express_validator_1.body)('billing_address').notEmpty().withMessage('Billing address is required'),
    (0, express_validator_1.body)('city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('state').isIn(INDIAN_STATES_AND_UTS).withMessage('Please select a valid Indian state or UT'),
    (0, express_validator_1.body)('pin_code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('PIN code must be exactly 6 digits'),
], validateRequest_1.validateRequest, profileController.updateBilling);
// Real-time Event Stats (Protected)
router.get('/event-stats/:booking_id', authMiddleware_1.authMiddleware, organizerController.getEventStats);
// Organizer notifications (Protected)
router.get('/notifications/:booking_id', authMiddleware_1.authMiddleware, notificationController.listNotifications);
router.post('/notifications/:booking_id/read-all', authMiddleware_1.authMiddleware, notificationController.markNotificationsRead);
// Step 2: Email Verification (Registration)
router.post('/verify-otp', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], validateRequest_1.validateRequest, organizerController.verifyOtp);
// Resend OTP
router.post('/resend-otp', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
], validateRequest_1.validateRequest, organizerController.resendOtp);
// Step 3: Activity Selection & Booking Creation
router.post('/create-booking', [
    (0, express_validator_1.body)('organizer_id').isNumeric().withMessage('Organizer ID must be numeric'),
    (0, express_validator_1.body)('activity_id').isNumeric().withMessage('Activity ID must be numeric'),
    (0, express_validator_1.body)('game_id').isNumeric().withMessage('Game ID must be numeric'),
    (0, express_validator_1.body)('package_id').isNumeric().withMessage('Package ID must be numeric'),
    (0, express_validator_1.body)('scheduled_date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('scheduled_time').notEmpty().withMessage('Time is required'),
], validateRequest_1.validateRequest, organizerController.createBooking);
// Review Information
router.get('/booking/:booking_id', organizerController.getBookingDetails);
// Step 4: Final Details & Payment Confirmation
router.post('/complete-booking', [
    (0, express_validator_1.body)('booking_id').isNumeric().withMessage('Booking ID must be numeric'),
    (0, express_validator_1.body)('gst_number')
        .notEmpty().withMessage('GST number is required')
        .isLength({ min: 15, max: 15 }).withMessage('GST number must be 15 characters')
        .matches(/^[0-9A-Za-z]{15}$/).withMessage('GST number must contain only letters and numbers'),
    (0, express_validator_1.body)('billing_address').notEmpty().withMessage('Billing address is required'),
    (0, express_validator_1.body)('city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('state').isIn(INDIAN_STATES_AND_UTS).withMessage('Please select a valid Indian state or UT'),
    (0, express_validator_1.body)('pin_code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('PIN code must be exactly 6 digits'),
    (0, express_validator_1.body)('payment_method').notEmpty().withMessage('Payment method is required'),
    (0, express_validator_1.body)('consents').isObject().withMessage('Consents must be an object'),
    (0, express_validator_1.body)('consents.authorization').isBoolean().equals('true').withMessage('Authorization is required'),
    (0, express_validator_1.body)('consents.participant_consent').isBoolean().equals('true').withMessage('Participant consent is required'),
    (0, express_validator_1.body)('consents.terms_accepted').isBoolean().equals('true').withMessage('Terms acceptance is required'),
    (0, express_validator_1.body)('consents.non_refundable_accepted').isBoolean().equals('true').withMessage('Non-refundable policy acceptance is required'),
    (0, express_validator_1.body)('consents.validity_accepted').isBoolean().equals('true').withMessage('Booking validity acceptance is required'),
], validateRequest_1.validateRequest, organizerController.completeBooking);
// Payment Confirmation (webhook or manual)
router.post('/confirm-payment', [
    (0, express_validator_1.body)('booking_id').optional().isNumeric().withMessage('Booking ID must be numeric'),
    (0, express_validator_1.body)('billing_id').optional().isNumeric().withMessage('Billing ID must be numeric'),
], validateRequest_1.validateRequest, organizerController.confirmPayment);
// Update Session Date/Time (One-time only)
router.post('/update-session', authMiddleware_1.authMiddleware, [
    (0, express_validator_1.body)('booking_id').isNumeric().withMessage('Booking ID must be numeric'),
    (0, express_validator_1.body)('scheduled_date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('scheduled_time').notEmpty().withMessage('Time is required'),
], validateRequest_1.validateRequest, organizerController.updateSession);
// Results tab — completed/incomplete groups with results-PDF availability
router.get('/results', authMiddleware_1.authMiddleware, organizerController.getOrganizerResults);
// Account deactivation (soft delete — billing/GST records retained)
router.post('/account/delete', authMiddleware_1.authMiddleware, organizerController.deactivateAccount);
exports.default = router;
