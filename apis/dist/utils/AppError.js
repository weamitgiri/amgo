"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
/**
 * Custom Application Error Class
 */
class AppError extends Error {
    constructor(message, statusCode = 500, errorData = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorData = errorData;
        this.isOperational = true; // For distinguishing between operational and programming errors
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
