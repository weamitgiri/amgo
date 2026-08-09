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
const participantController = __importStar(require("../controllers/participantController"));
const joinLinkController = __importStar(require("../controllers/joinLinkController"));
const validateRequest_1 = require("../middlewares/validateRequest");
const joinLinkRateLimit_1 = require("../middlewares/joinLinkRateLimit");
const router = (0, express_1.Router)();
// Verify invitation link
router.get('/verify-link/:link_token', participantController.verifyInvitation);
// Join link lookup — rate limited separately (2 min window)
router.get('/join_links/:link_token', joinLinkRateLimit_1.joinLinkRateLimit, joinLinkController.getJoinLink);
router.get('/join-links/:link_token', joinLinkRateLimit_1.joinLinkRateLimit, joinLinkController.getJoinLink);
// Step 1: Join with Name & Email
router.post('/join', [
    (0, express_validator_1.body)('booking_id').isNumeric().withMessage('Booking ID is required'),
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
], validateRequest_1.validateRequest, participantController.participantJoin);
// Step 2: Verify OTP & Assign Group
router.post('/verify-otp', [
    (0, express_validator_1.body)('booking_id').isNumeric().withMessage('Booking ID is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], validateRequest_1.validateRequest, participantController.verifyParticipantOtp);
// Get Lobby Information
router.get('/lobby/:group_id', participantController.getLobbyInfo);
// Case summary / game screen
router.get('/game-summary/:group_id', participantController.getGameSummary);
exports.default = router;
