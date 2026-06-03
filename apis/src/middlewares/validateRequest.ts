import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors: any = {};
        errors.array().forEach((err: any) => {
            if (!formattedErrors[err.path]) {
                formattedErrors[err.path] = [];
            }
            formattedErrors[err.path].push(err.msg);
        });
        return errorResponse(res, 'Validation error', formattedErrors, 422);
    }
    next();
};
