/**
 * Custom Application Error Class
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errorData: any;

    constructor(message: string, statusCode: number = 500, errorData: any = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorData = errorData;
        this.isOperational = true; // For distinguishing between operational and programming errors

        Error.captureStackTrace(this, this.constructor);
    }
}
