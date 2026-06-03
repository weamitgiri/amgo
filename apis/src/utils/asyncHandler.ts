import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper for async route handlers to catch errors and pass them to next()
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
