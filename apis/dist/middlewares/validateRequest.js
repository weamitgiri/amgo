"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const apiResponse_1 = require("../utils/apiResponse");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formattedErrors = {};
        errors.array().forEach((err) => {
            if (!formattedErrors[err.path]) {
                formattedErrors[err.path] = [];
            }
            formattedErrors[err.path].push(err.msg);
        });
        return (0, apiResponse_1.errorResponse)(res, 'Validation error', formattedErrors, 422);
    }
    next();
};
exports.validateRequest = validateRequest;
