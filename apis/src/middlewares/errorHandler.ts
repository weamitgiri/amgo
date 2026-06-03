import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';
import logger from '../utils/logger';

/**
 * Global Error Handling Middleware
 * Catches all unhandled errors and returns a standardized JSON response
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // In production, we don't want to leak full error stack to the client
    const isProduction = process.env.NODE_ENV === 'production';

    // Log the error internally
    logger.error(`${err.message}`, { 
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errorData = err.errorData || (isProduction ? null : err.stack);

    // Handle common MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        message = 'Duplicate entry found';
    }

    // Handle specific JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your token has expired. Please log in again.';
    }

    return errorResponse(res, message, errorData, statusCode);
};
