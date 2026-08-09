"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
/**
 * Send Success Response
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message,
        data: data || null,
        error: null,
        statusCode
    };
    return res.status(statusCode).json(response);
};
exports.successResponse = successResponse;
/**
 * Send Error Response
 */
const errorResponse = (res, message, error = null, statusCode = 400) => {
    const response = {
        success: false,
        message,
        data: null,
        error: error || null,
        statusCode
    };
    return res.status(statusCode).json(response);
};
exports.errorResponse = errorResponse;
