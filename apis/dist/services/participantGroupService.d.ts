import type { PoolConnection } from 'mysql2/promise';
export declare function assignParticipantToGroup(conn: PoolConnection, bookingId: number | string, participantId: number, email: string): Promise<{
    groupId: number;
    groupName: string;
    alreadyVerified: boolean;
}>;
export declare function assertCanStartJoin(bookingId: number | string, email: string): Promise<void>;
