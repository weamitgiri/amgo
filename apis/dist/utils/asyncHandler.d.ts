import { Request, Response, NextFunction } from 'express';
/**
 * Wrapper for async route handlers to catch errors and pass them to next()
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
