import nodemailer from 'nodemailer';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp-relay.sendinblue.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    auth: {
        user: process.env.MAIL_USERNAME || 'info@jinjoodock.com',
        pass: process.env.MAIL_PASSWORD || '5VpWKxg1ATNU0qjt',
    },
});

export const sendOtpEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME || 'GTEST'}" <${process.env.MAIL_FROM_ADDRESS || 'support@brsoftech.com'}>`,
        to: email,
        subject: 'Your OTP for Registration',
        text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your OTP for registration is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`OTP sent to ${email}`);
    } catch (error) {
        logger.error('Error sending OTP email:', error);
    }
};
