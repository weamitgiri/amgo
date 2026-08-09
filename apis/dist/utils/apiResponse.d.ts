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
export declare const successResponse: (res: Response, message: string, data?: any, statusCode?: number) => Response<any, Record<string, any>>;
/**
 * Send Error Response
 */
export declare const errorResponse: (res: Response, message: string, error?: any, statusCode?: number) => Response<any, Record<string, any>>;
