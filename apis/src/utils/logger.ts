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
 * Log Format
 */
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

/**
 * Define Transports
 */
const transports = [
    // Console transport
    new winston.transports.Console(),
    
    // Error log file transport
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }),
    
    // All logs file transport
    new winston.transports.File({ filename: 'logs/all.log' }),
];

/**
 * Initialize Logger
 */
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

export default logger;
