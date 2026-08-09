/**
 * Custom Application Error Class
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly errorData: any;
    constructor(message: string, statusCode?: number, errorData?: any);
}
