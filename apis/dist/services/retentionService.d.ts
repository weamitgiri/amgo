/**
 * Permanently removes participant PII and game content for a group whose
 * `retention_purge_at` has passed. Never touches organizers, organizer_bookings, or
 * organizer_billings — those carry the HR email, booking date/package, and GST
 * invoice, all of which the FSD requires retaining indefinitely.
 */
export declare function purgeGroupParticipantData(groupId: number | string): Promise<void>;
export declare function runRetentionSweep(): Promise<void>;
