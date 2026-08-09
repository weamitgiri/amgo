"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.MAIL_HOST || 'smtp-relay.sendinblue.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
        user: process.env.MAIL_USERNAME || 'info@jinjoodock.com',
        pass: process.env.MAIL_PASSWORD || '5VpWKxg1ATNU0qjt',
    },
});
const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'GTEST'}" <${process.env.MAIL_FROM_ADDRESS || 'support@brsoftech.com'}>`,
        to: email,
        subject: 'Your OTP for Registration',
        text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your OTP for registration is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    };
    try {
        await transporter.sendMail(mailOptions);
        logger_1.default.info(`OTP sent to ${email}`);
    }
    catch (error) {
        logger_1.default.error('Error sending OTP email:', error);
    }
};
exports.sendOtpEmail = sendOtpEmail;
