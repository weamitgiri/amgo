import { Request, Response, NextFunction } from 'express';
/**
 * Global Error Handling Middleware
 * Catches all unhandled errors and returns a standardized JSON response
 */
export declare const globalErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
