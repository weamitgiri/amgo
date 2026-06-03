import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export type QueryResult<T = any> = RowDataPacket[] & T[];

function parseMysqlUrl(url: string) {
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

export const pool: Pool = mysql.createPool({
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

export async function query<T = any>(sql: string, params: any[] = []): Promise<[T[], ResultSetHeader | undefined]> {
    try {
        const [rows, meta] = await pool.query(sql, params);
        // meta is ResultSetHeader for INSERT/UPDATE/DELETE, else FieldPacket[]
        const header = (meta as any)?.affectedRows !== undefined ? (meta as unknown as ResultSetHeader) : undefined;
        return [rows as unknown as T[], header];
    } catch (err: any) {
        // Keep message safe but actionable
        err.message = `[DB] Query failed: ${err.message}`;
        throw err;
    }
}

export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
    } catch (err) {
        try {
            await conn.rollback();
        } catch (_) {
            // ignore rollback errors
        }
        throw err;
    } finally {
        conn.release();
    }
}

