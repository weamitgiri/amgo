import { Response } from 'express';

/**
 * Standard API Response Structure
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T | null;
    error: any | null;
    statusCode: number;
}

/**
 * Send Success Response
 */
export const successResponse = (
    res: Response, 
    message: string, 
    data: any = null, 
    statusCode: number = 200
) => {
    const response: ApiResponse = {
        success: true,
        message,
        data: data || null,
        error: null,
        statusCode
    };
    return res.status(statusCode).json(response);
};

/**
 * Send Error Response
 */
export const errorResponse = (
    res: Response, 
    message: string, 
    error: any = null, 
    statusCode: number = 400
) => {
    const response: ApiResponse = {
        success: false,
        message,
        data: null,
        error: error || null,
        statusCode
    };
    return res.status(statusCode).json(response);
};
