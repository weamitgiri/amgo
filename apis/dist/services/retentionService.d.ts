/**
 * Permanently removes participant PII and game content for a group whose
 * `retention_purge_at` has passed. Never touches organizers, organizer_bookings, or
 * organizer_billings — those carry the HR email, booking date/package, and GST
 * invoice, all of which the FSD requires retaining indefinitely.
 */
export declare function purgeGroupParticipantData(groupId: number | string): Promise<void>;
/**
 * Permanently DELETES all joining data for one booking (game event): every
 * participant who joined, every group that was formed, and their group-membership
 * (participant_sessions) rows — plus the per-group game content those rows own.
 * Covers complete, incomplete AND never-filled groups uniformly, since it is
 * scoped by booking_id, not group status.
 *
 * Scoped to this booking only (other events are never touched), and it never
 * touches organizers, organizer_bookings or organizer_billings (the HR account,
 * booking and GST records). The HR results PDF is captured to disk first so HR
 * keeps the session results after the rows are gone.
 */
export declare function purgeBookingJoiningData(bookingId: number | string): Promise<void>;
export declare function runRetentionSweep(): Promise<void>;
