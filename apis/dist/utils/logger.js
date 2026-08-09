"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
/**
 * Custom Logging Levels
 */
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
/**
 * Determine log level based on environment
 */
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'warn';
};
/**
 * Custom Colors for Levels
 */
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
/**
 * Log Formats — colors are console-only; log files get clean parseable lines
 * so the admin-panel log viewer can read them without ANSI escape codes.
 */
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
/**
 * Define Transports
 */
const transports = [
    // Console transport (colored)
    new winston_1.default.transports.Console({ format: consoleFormat }),
    // Error log file transport (plain text)
    new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: fileFormat,
    }),
    // All logs file transport (plain text)
    new winston_1.default.transports.File({ filename: 'logs/all.log', format: fileFormat }),
];
/**
 * Initialize Logger
 */
const logger = winston_1.default.createLogger({
    level: level(),
    levels,
    transports,
});
exports.default = logger;
