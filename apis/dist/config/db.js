"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.withTransaction = withTransaction;
const promise_1 = __importDefault(require("mysql2/promise"));
function parseMysqlUrl(url) {
    // Example: mysql://user:pass@127.0.0.1:3306/dbname
    const u = new URL(url);
    return {
        host: u.hostname,
        port: u.port ? Number(u.port) : 3306,
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.replace(/^\//, ''),
    };
}
function getDbConfig() {
    const hasDiscrete = !!process.env.DB_HOST || !!process.env.DB_USER || !!process.env.DB_NAME;
    if (hasDiscrete) {
        return {
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || '',
        };
    }
    if (process.env.DATABASE_URL) {
        return parseMysqlUrl(process.env.DATABASE_URL);
    }
    throw new Error('Database configuration missing. Set DB_HOST/DB_USER/DB_PASSWORD/DB_NAME (preferred) or DATABASE_URL.');
}
const cfg = getDbConfig();
exports.pool = promise_1.default.createPool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    waitForConnections: true,
    connectionLimit: process.env.DB_POOL_SIZE ? Number(process.env.DB_POOL_SIZE) : 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    supportBigNumbers: true,
    bigNumberStrings: true, // avoid JS precision loss
    namedPlaceholders: false,
    timezone: process.env.DB_TIMEZONE || '+05:30',
    dateStrings: true, // preserve DB date/time formats and avoid automatic UTC conversion
});
async function query(sql, params = []) {
    try {
        const [rows, meta] = await exports.pool.query(sql, params);
        // meta is ResultSetHeader for INSERT/UPDATE/DELETE, else FieldPacket[]
        const header = meta?.affectedRows !== undefined ? meta : undefined;
        return [rows, header];
    }
    catch (err) {
        // Keep message safe but actionable
        err.message = `[DB] Query failed: ${err.message}`;
        throw err;
    }
}
async function withTransaction(fn) {
    const conn = await exports.pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
    }
    catch (err) {
        try {
            await conn.rollback();
        }
        catch (_) {
            // ignore rollback errors
        }
        throw err;
    }
    finally {
        conn.release();
    }
}
