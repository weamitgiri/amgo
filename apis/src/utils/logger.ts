import winston from 'winston';

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

winston.addColors(colors);

/**
 * Log Formats — colors are console-only; log files get clean parseable lines
 * so the admin-panel log viewer can read them without ANSI escape codes.
 */
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

/**
 * Define Transports
 */
const transports = [
    // Console transport (colored)
    new winston.transports.Console({ format: consoleFormat }),

    // Error log file transport (plain text)
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: fileFormat,
    }),

    // All logs file transport (plain text)
    new winston.transports.File({ filename: 'logs/all.log', format: fileFormat }),
];

/**
 * Initialize Logger
 */
const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
});

export default logger;
