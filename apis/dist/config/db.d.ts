import { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
export type QueryResult<T = any> = RowDataPacket[] & T[];
export declare const pool: Pool;
export declare function query<T = any>(sql: string, params?: any[]): Promise<[T[], ResultSetHeader | undefined]>;
export declare function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T>;
