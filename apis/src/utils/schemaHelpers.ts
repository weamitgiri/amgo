import { query } from '../config/db';

export async function ensureOrganizerStatusColumns(): Promise<void> {
    try {
        const [paymentRows] = await query("SHOW COLUMNS FROM organizers LIKE 'payment_status'");
        const [accountRows] = await query("SHOW COLUMNS FROM organizers LIKE 'account_status'");

        const hasPayment = (paymentRows as any).length > 0;
        const hasAccount = (accountRows as any).length > 0;

        if (hasPayment && hasAccount) return;

        const parts: string[] = [];
        if (!hasPayment) {
            parts.push("ADD COLUMN payment_status ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending'");
        }
        if (!hasAccount) {
            parts.push("ADD COLUMN account_status ENUM('pending','active','inactive') NOT NULL DEFAULT 'pending'");
        }

        if (parts.length > 0) {
            const sql = `ALTER TABLE organizers ${parts.join(', ')}`;
            await query(sql);
        }
    } catch (err: any) {
        // If we cannot modify schema (lack of privileges), just log and continue — callers will handle missing columns gracefully
        console.warn('[schemaHelpers] Could not ensure organizer columns:', err.message || err);
    }
}

export async function ensureGameGroupRetentionColumns(): Promise<void> {
    try {
        const [statusRows] = await query<any>("SHOW COLUMNS FROM game_groups LIKE 'status'");
        const statusType: string = statusRows?.[0]?.Type || '';
        if (statusType && !statusType.includes("'completed'")) {
            await query(
                "ALTER TABLE game_groups MODIFY COLUMN status ENUM('waiting','active','finished','completed','incomplete') NOT NULL DEFAULT 'waiting'"
            );
        }

        const columns = [
            { name: 'completed_at', ddl: 'ADD COLUMN completed_at TIMESTAMP NULL DEFAULT NULL' },
            { name: 'retention_purge_at', ddl: 'ADD COLUMN retention_purge_at TIMESTAMP NULL DEFAULT NULL' },
            { name: 'purged_at', ddl: 'ADD COLUMN purged_at TIMESTAMP NULL DEFAULT NULL' },
            { name: 'results_pdf_path', ddl: 'ADD COLUMN results_pdf_path VARCHAR(255) NULL DEFAULT NULL' },
            { name: 'results_pdf_expires_at', ddl: 'ADD COLUMN results_pdf_expires_at TIMESTAMP NULL DEFAULT NULL' },
        ];

        const missing: string[] = [];
        for (const col of columns) {
            const [rows] = await query<any>(`SHOW COLUMNS FROM game_groups LIKE '${col.name}'`);
            if ((rows as any).length === 0) missing.push(col.ddl);
        }

        if (missing.length > 0) {
            await query(`ALTER TABLE game_groups ${missing.join(', ')}`);
        }
    } catch (err: any) {
        console.warn('[schemaHelpers] Could not ensure game_groups retention columns:', err.message || err);
    }
}

export async function ensureParticipantSessionsLeftAt(): Promise<void> {
    try {
        const [rows] = await query<any>("SHOW COLUMNS FROM participant_sessions LIKE 'left_at'");
        if ((rows as any).length === 0) {
            await query('ALTER TABLE participant_sessions ADD COLUMN left_at TIMESTAMP NULL DEFAULT NULL');
        }
    } catch (err: any) {
        console.warn('[schemaHelpers] Could not ensure participant_sessions.left_at:', err.message || err);
    }
}

export async function ensureTimersReferenceId(): Promise<void> {
    try {
        const [rows] = await query<any>("SHOW COLUMNS FROM timers LIKE 'reference_id'");
        if ((rows as any).length === 0) {
            await query('ALTER TABLE timers ADD COLUMN reference_id BIGINT UNSIGNED NULL DEFAULT NULL AFTER timer_type');
        }
    } catch (err: any) {
        console.warn('[schemaHelpers] Could not ensure timers.reference_id:', err.message || err);
    }
}

export async function ensureVotesTable(): Promise<void> {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS votes (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                group_id BIGINT UNSIGNED NOT NULL,
                voter_id BIGINT UNSIGNED NOT NULL,
                reference_id BIGINT UNSIGNED NOT NULL,
                reference_type VARCHAR(50) NOT NULL,
                vote_value VARCHAR(20) NOT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY votes_unique_voter_per_reference (reference_id, reference_type, voter_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);
    } catch (err: any) {
        console.warn('[schemaHelpers] Could not ensure votes table:', err.message || err);
    }
}

export async function ensureGroupAccusationsTable(): Promise<void> {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS group_accusations (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                group_id BIGINT UNSIGNED NOT NULL,
                participant_session_id BIGINT UNSIGNED NOT NULL,
                accused_session_id BIGINT UNSIGNED NOT NULL,
                reasoning TEXT NOT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY group_accusations_one_per_session (participant_session_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `);
    } catch (err: any) {
        console.warn('[schemaHelpers] Could not ensure group_accusations table:', err.message || err);
    }
}

export async function ensureResultsScoringColumns(): Promise<void> {
    try {
        const columns = [
            { name: 'correct_guess_count', ddl: 'ADD COLUMN correct_guess_count TINYINT UNSIGNED NULL DEFAULT NULL' },
            { name: 'per_role_results', ddl: 'ADD COLUMN per_role_results JSON NULL DEFAULT NULL' },
        ];
        const missing: string[] = [];
        for (const col of columns) {
            const [rows] = await query<any>(`SHOW COLUMNS FROM results LIKE '${col.name}'`);
            if ((rows as any).length === 0) missing.push(col.ddl);
        }
        if (missing.length > 0) {
            await query(`ALTER TABLE results ${missing.join(', ')}`);
        }
    } catch (err: any) {
        console.warn('[schemaHelpers] Could not ensure results scoring columns:', err.message || err);
    }
}

export async function ensureActivityGamesVictimName(): Promise<void> {
    try {
        const [rows] = await query<any>("SHOW COLUMNS FROM activity_games LIKE 'victim_name'");
        if ((rows as any).length === 0) {
            await query("ALTER TABLE activity_games ADD COLUMN victim_name VARCHAR(255) NULL DEFAULT NULL");
        }
        // Populate the seeded "Bungalow Secret" case with its known victim name if not already set.
        await query(
            "UPDATE activity_games SET victim_name = 'Raghav Malhotra' WHERE title = 'The Bungalow Secret' AND (victim_name IS NULL OR victim_name = '')"
        );
    } catch (err: any) {
        console.warn('[schemaHelpers] Could not ensure activity_games.victim_name:', err.message || err);
    }
}

export async function ensureGameDurationDefault(): Promise<void> {
    try {
        // Total session should be 25 minutes (5 min case summary + 20 min investigation).
        // Only touch rows that still hold the old default combination, so a deliberately
        // customized activity is never clobbered.
        await query(
            "ALTER TABLE activities ALTER COLUMN game_duration_secs SET DEFAULT 1500"
        );
        await query(
            "UPDATE activities SET game_duration_secs = 1500 WHERE game_duration_secs = 1200 AND case_summary_view_secs = 300"
        );
    } catch (err: any) {
        console.warn('[schemaHelpers] Could not ensure game_duration default:', err.message || err);
    }
}

export async function ensureGameGroupsGameId(): Promise<void> {
    try {
        const [rows] = await query<any>("SHOW COLUMNS FROM game_groups LIKE 'game_id'");
        if ((rows as any).length === 0) {
            await query('ALTER TABLE game_groups ADD COLUMN game_id BIGINT UNSIGNED NULL DEFAULT NULL AFTER booking_id');
        }
        // Backfill existing groups from the booking-level game so pre-existing
        // sessions keep resolving the same game they were playing.
        await query(`
            UPDATE game_groups gg
            JOIN organizer_bookings ob ON gg.booking_id = ob.id
            SET gg.game_id = ob.game_id
            WHERE gg.game_id IS NULL AND ob.game_id IS NOT NULL
        `);
    } catch (err: any) {
        console.warn('[schemaHelpers] Could not ensure game_groups.game_id:', err.message || err);
    }
}

export async function ensureGameSchemaUpdates(): Promise<void> {
    await ensureGameGroupRetentionColumns();
    await ensureGameGroupsGameId();
    await ensureParticipantSessionsLeftAt();
    await ensureTimersReferenceId();
    await ensureVotesTable();
    await ensureGroupAccusationsTable();
    await ensureResultsScoringColumns();
    await ensureActivityGamesVictimName();
    await ensureGameDurationDefault();
}

export default ensureOrganizerStatusColumns;
