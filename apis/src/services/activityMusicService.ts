import { query } from '../config/db';

/**
 * Background music per game activity, managed in the admin Music Manager
 * (activity_music table). At most one track per activity is active; only the
 * active one is ever served to the website.
 */
export type ActivityMusicTrack = {
    id: number;
    activity_id: number;
    title: string;
    /** Path on the Laravel public disk; the frontend resolves it with its storage base URL. */
    file_path: string;
    mime_type: string | null;
};

const TRACK_COLUMNS = 'm.id, m.activity_id, m.title, m.file_path, m.mime_type';

/** The active track of an activity, looked up by numeric id or slug; null when there is none. */
export async function getActiveTrackForActivity(activity: string | number): Promise<ActivityMusicTrack | null> {
    const ref = String(activity).trim();
    if (!ref) return null;

    const byId = /^\d+$/.test(ref);
    const [rows] = await query(
        `SELECT ${TRACK_COLUMNS}
         FROM activity_music m
         JOIN activities a ON a.id = m.activity_id
         WHERE ${byId ? 'a.id = ?' : 'a.slug = ?'} AND m.status = 1
         ORDER BY m.updated_at DESC, m.id DESC
         LIMIT 1`,
        [byId ? Number(ref) : ref]
    );
    return (rows[0] as ActivityMusicTrack) ?? null;
}

/** The active track of the activity a participant group is playing; null when there is none. */
export async function getActiveTrackForGroup(groupId: string | number): Promise<ActivityMusicTrack | null> {
    const [rows] = await query(
        `SELECT ${TRACK_COLUMNS}
         FROM game_groups gg
         JOIN organizer_bookings ob ON ob.id = gg.booking_id
         JOIN activity_music m ON m.activity_id = ob.activity_id AND m.status = 1
         WHERE gg.id = ?
         ORDER BY m.updated_at DESC, m.id DESC
         LIMIT 1`,
        [groupId]
    );
    return (rows[0] as ActivityMusicTrack) ?? null;
}
