import type { PoolConnection } from 'mysql2/promise';
export declare function assignParticipantToGroup(conn: PoolConnection, bookingId: number | string, participantId: number, email: string): Promise<{
    groupId: number;
    groupName: string;
    alreadyVerified: boolean;
}>;
export declare function assertCanStartJoin(bookingId: number | string, email: string): Promise<void>;
/**
 * One participant per browser. The browser sends the join token it received from
 * its last successful OTP verification (X-Participant-Token). If that token still
 * belongs to a verified participant whose game is running, only that same
 * participant (same booking + email) may join from this browser; anyone else is
 * refused until that game ends or the player leaves (the frontend then drops the
 * token). The identity comes from the server-issued token, never from a
 * client-supplied participant id. Other browsers/devices send no token and are
 * unaffected.
 */
export declare function assertBrowserNotBoundToOtherParticipant(browserToken: unknown, bookingId: number | string, email: string): Promise<void>;
