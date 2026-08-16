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

export async function ensureCookAndCreateSchema(): Promise<void> {
    try {
        // 1. Make sure activity exists in activities table
        const [ccActivity] = await query<any>(`SELECT id, slug FROM activities WHERE slug = 'cook-and-create'`);
        let ccActivityId: number;
        if ((ccActivity as any).length === 0) {
            const [result] = await query<any>(
                `INSERT INTO activities (title, slug, description, status, lobby_wait_secs, entry_cutoff_mins,
                    game_duration_secs, case_summary_view_secs, strategy_guide_delay_secs, clue_room_unlock_secs,
                    question_response_secs, max_questions, group_size, auto_expire_days, win_bonus,
                    participation_bonus, timely_response_bonus, no_response_penalty, wrong_vote_penalty,
                    lie_detector_enabled, lie_detector_max_questions, lie_detector_timer_secs,
                    lie_detector_voting_timer_secs, icon, created_at, updated_at)
                VALUES (?, ?, ?, 'active', 900, 15, 1500, 0, 0, 0, 120, 0, 5, 5, 100, 50, 20, -10, -15,
                    0, 0, 0, 0, '🍳', NOW(), NOW())`,
                [
                    'Cook & Create', 'cook-and-create',
                    'A fun cooking-themed impostor game where players collaborate to create the best dish while finding the hidden impostor among them!'
                ]
            );
            ccActivityId = Number((result as any).insertId);
        } else {
            ccActivityId = Number(ccActivity[0].id);
        }

        // 2. Create cc_ingredients table
        await query(`
            CREATE TABLE IF NOT EXISTS cc_ingredients (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                image_url VARCHAR(255) DEFAULT NULL,
                is_absurd TINYINT(1) NOT NULL DEFAULT 0,
                activity_id BIGINT UNSIGNED NOT NULL DEFAULT 2,
                status ENUM('active','inactive') NOT NULL DEFAULT 'active',
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                KEY activity_id (activity_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 3. Seed default ingredients if empty
        const [ingCount] = await query<any>(`SELECT COUNT(*) as c FROM cc_ingredients`);
        if (Number((ingCount as any)[0].c) === 0) {
            const defaultIngs = [
                ['Chicken', '/assets/cookandcreate/chicken.jpg', 0],
                ['Paneer', '/assets/cookandcreate/paneer.jpg', 0],
                ['Tomatoes', '/assets/cookandcreate/tomatoes.jpg', 0],
                ['Ice Cubes', '/assets/cookandcreate/ice-cubes.jpg', 1],
                ['Garlic', '/assets/cookandcreate/garlic.jpg', 0],
                ['Cream', '/assets/cookandcreate/cream.jpg', 0],
                ['Soy Sauce', '/assets/cookandcreate/soy-sauce.jpg', 0],
                ['Sand', '/assets/cookandcreate/sand.jpg', 1],
                ['Onions', '/assets/cookandcreate/onions.jpg', 0],
                ['Butter', '/assets/cookandcreate/butter.jpg', 0],
            ];
            const values = defaultIngs.map((ing) => [ing[0], ing[1], ing[2], ccActivityId, 'active', new Date(), new Date()]);
            await query<any>(
                `INSERT INTO cc_ingredients (name, image_url, is_absurd, activity_id, status, created_at, updated_at) VALUES ?`,
                // @ts-ignore
                [values]
            );
        }

        // 4. Create cc_game_templates
        await query(`
            CREATE TABLE IF NOT EXISTS cc_game_templates (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                activity_game_id BIGINT UNSIGNED NOT NULL,
                name VARCHAR(255) NOT NULL,
                tagline VARCHAR(255) DEFAULT NULL,
                description TEXT,
                round1_ingredients_count INT UNSIGNED NOT NULL DEFAULT 10,
                round1_votes_per_player INT UNSIGNED NOT NULL DEFAULT 2,
                round1_top_ingredients INT UNSIGNED NOT NULL DEFAULT 4,
                round1_timer_secs INT UNSIGNED NOT NULL DEFAULT 120,
                round2_step_max_chars INT UNSIGNED NOT NULL DEFAULT 120,
                round2_submit_timer_secs INT UNSIGNED NOT NULL DEFAULT 120,
                round2_review_timer_secs INT UNSIGNED NOT NULL DEFAULT 120,
                round3_discussion_timer_secs INT UNSIGNED NOT NULL DEFAULT 60,
                round3_voting_timer_secs INT UNSIGNED NOT NULL DEFAULT 120,
                round3_max_messages_per_player INT UNSIGNED NOT NULL DEFAULT 2,
                show_host_role_enabled TINYINT(1) NOT NULL DEFAULT 1,
                impostor_bias_card_text TEXT,
                status ENUM('draft','active') NOT NULL DEFAULT 'active',
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                KEY activity_game_id (activity_game_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // 5. activity_games entry
        const [agRows] = await query<any>(`SELECT id FROM activity_games WHERE activity_id = ? AND title = 'Kitchen Chaos'`, [ccActivityId]);
        let activityGameId: number;
        if ((agRows as any).length === 0) {
            const brief = `<h3>Game Brief</h3><p>Welcome to the chaotic kitchen of MasterChef Impostor! Your team has 25 minutes to create the best dish you can imagine. But beware — one of you is the Hidden Impostor whose only goal is to mislead the group into creating the worst dish possible!</p><p>Round 1: Vote for the best ingredients (top 4 selected)!<br/>Round 2: Each of you submits one cooking step, then the group votes to keep or remove each step!<br/>Round 3: 60-second group chat, then vote to eliminate who you think the impostor is!</p>`;
            const [agResult] = await query<any>(
                `INSERT INTO activity_games (activity_id, title, case_summary, tagline, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', NOW(), NOW())`,
                [ccActivityId, 'Kitchen Chaos', brief, 'Create the perfect dish… while rooting out the impostor.']
            );
            activityGameId = Number((agResult as any).insertId);
        } else {
            activityGameId = Number(agRows[0].id);
        }

        // 6. Seed default template if not exists
        const [tplRows] = await query<any>(`SELECT id FROM cc_game_templates WHERE activity_game_id = ? AND name = 'Kitchen Chaos'`, [activityGameId]);
        let defaultTplId: number;
        const impostorBias = `<strong>You are the Impostor. Your Bias Card:</strong><ul><li>Always vote for the most useless/absurd ingredient in every round.</li><li>Submit one deliberately bad cooking step (but act natural!).</li><li>Try to mislead the group into removing good steps and keeping bad ones.</li><li>Deflect accusations, stay calm — don't deny too hard!</li></ul>`;
        if ((tplRows as any).length === 0) {
            const [tplResult] = await query<any>(
                `INSERT INTO cc_game_templates (activity_game_id, name, tagline, description, round1_ingredients_count,
                    round1_votes_per_player, round1_top_ingredients, round1_timer_secs, round2_step_max_chars,
                    round2_submit_timer_secs, round2_review_timer_secs, round3_discussion_timer_secs,
                    round3_voting_timer_secs, round3_max_messages_per_player, show_host_role_enabled,
                    impostor_bias_card_text, status, created_at, updated_at)
                VALUES (?, ?, ?, 'Standard 5-player game with impostor, show host, and 3 chef roles!',
                    10, 2, 4, 120, 120, 120, 120, 60, 120, 2, 1, ?, 'active', NOW(), NOW())`,
                [activityGameId, 'Kitchen Chaos', 'Create the perfect dish… while rooting out the impostor.', impostorBias]
            );
            defaultTplId = Number((tplResult as any).insertId);
        } else {
            defaultTplId = Number(tplRows[0].id);
        }

        // 7. Create remaining cc_* tables
        const tableDDLs = [
            `CREATE TABLE IF NOT EXISTS cc_game_template_ingredients (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                template_id BIGINT UNSIGNED NOT NULL,
                ingredient_id BIGINT UNSIGNED NOT NULL,
                \`order\` INT UNSIGNED NOT NULL DEFAULT 0,
                KEY template_id (template_id),
                KEY ingredient_id (ingredient_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_clues (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                template_id BIGINT UNSIGNED NOT NULL,
                round_number TINYINT UNSIGNED NOT NULL,
                clue_text TEXT NOT NULL,
                \`order\` INT UNSIGNED NOT NULL DEFAULT 0,
                KEY template_id (template_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_game_rules (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                template_id BIGINT UNSIGNED NOT NULL,
                rule_text TEXT NOT NULL,
                \`order\` INT UNSIGNED NOT NULL DEFAULT 0,
                KEY template_id (template_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_game_instances (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                group_id BIGINT UNSIGNED NOT NULL UNIQUE,
                template_id BIGINT UNSIGNED NOT NULL,
                activity_id BIGINT UNSIGNED NOT NULL DEFAULT 2,
                status ENUM('waiting','round1','round2','round3_discussion','round3_voting','completed') NOT NULL DEFAULT 'waiting',
                impostor_participant_id BIGINT UNSIGNED DEFAULT NULL,
                show_host_participant_id BIGINT UNSIGNED DEFAULT NULL,
                dish_name VARCHAR(255) DEFAULT NULL,
                dish_named_by_participant_id BIGINT UNSIGNED DEFAULT NULL,
                round1_started_at DATETIME DEFAULT NULL,
                round1_ended_at DATETIME DEFAULT NULL,
                round2_started_at DATETIME DEFAULT NULL,
                round2_ended_at DATETIME DEFAULT NULL,
                round3_discussion_started_at DATETIME DEFAULT NULL,
                round3_discussion_ended_at DATETIME DEFAULT NULL,
                round3_voting_started_at DATETIME DEFAULT NULL,
                round3_voting_ended_at DATETIME DEFAULT NULL,
                finished_at DATETIME DEFAULT NULL,
                group_won TINYINT(1) DEFAULT NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL,
                KEY template_id (template_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_round1_votes (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instance_id BIGINT UNSIGNED NOT NULL,
                participant_id BIGINT UNSIGNED NOT NULL,
                ingredient_id BIGINT UNSIGNED NOT NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY unique_vote (instance_id, participant_id, ingredient_id),
                KEY instance_id (instance_id),
                KEY participant_id (participant_id),
                KEY ingredient_id (ingredient_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_round1_selected_ingredients (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instance_id BIGINT UNSIGNED NOT NULL,
                ingredient_id BIGINT UNSIGNED NOT NULL,
                vote_count INT UNSIGNED NOT NULL DEFAULT 0,
                \`rank\` INT UNSIGNED NOT NULL,
                UNIQUE KEY unique_instance_ingredient (instance_id, ingredient_id),
                KEY instance_id (instance_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_round2_steps (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instance_id BIGINT UNSIGNED NOT NULL,
                participant_id BIGINT UNSIGNED NOT NULL,
                step_text TEXT NOT NULL,
                step_letter CHAR(1) NOT NULL,
                is_bad_step TINYINT(1) DEFAULT NULL,
                status ENUM('submitted','kept','removed') DEFAULT 'submitted',
                created_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY unique_participant_step (instance_id, participant_id),
                KEY instance_id (instance_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_round2_step_votes (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instance_id BIGINT UNSIGNED NOT NULL,
                participant_id BIGINT UNSIGNED NOT NULL,
                step_id BIGINT UNSIGNED NOT NULL,
                vote ENUM('keep','remove') NOT NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY unique_step_vote (instance_id, participant_id, step_id),
                KEY instance_id (instance_id),
                KEY step_id (step_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_round2_released_clues (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instance_id BIGINT UNSIGNED NOT NULL,
                clue_id BIGINT UNSIGNED NOT NULL,
                released_at DATETIME NOT NULL,
                UNIQUE KEY unique_clue_instance (instance_id, clue_id),
                KEY instance_id (instance_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_round3_messages (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instance_id BIGINT UNSIGNED NOT NULL,
                participant_id BIGINT UNSIGNED NOT NULL,
                message TEXT NOT NULL,
                is_impostor_private TINYINT(1) NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                KEY instance_id (instance_id),
                KEY participant_id (participant_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_round3_impostor_votes (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instance_id BIGINT UNSIGNED NOT NULL,
                participant_id BIGINT UNSIGNED NOT NULL,
                voted_for_participant_id BIGINT UNSIGNED NOT NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                UNIQUE KEY unique_vote_per_participant (instance_id, participant_id),
                KEY instance_id (instance_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_rating_categories (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) NOT NULL,
                emoji VARCHAR(20) DEFAULT NULL,
                description VARCHAR(255) DEFAULT NULL,
                status ENUM('active','inactive') NOT NULL DEFAULT 'active',
                \`order\` INT UNSIGNED NOT NULL DEFAULT 0,
                created_at TIMESTAMP NULL DEFAULT NULL,
                updated_at TIMESTAMP NULL DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
            `CREATE TABLE IF NOT EXISTS cc_ratings (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                instance_id BIGINT UNSIGNED NOT NULL,
                category_id BIGINT UNSIGNED NOT NULL,
                voting_participant_id BIGINT UNSIGNED NOT NULL,
                rated_group_id BIGINT UNSIGNED DEFAULT NULL,
                created_at TIMESTAMP NULL DEFAULT NULL,
                KEY instance_id (instance_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
        ];
        for (const ddl of tableDDLs) {
            await query(ddl);
        }

        // 8. Seed template ingredients if empty
        const [tplIngCount] = await query<any>(`SELECT COUNT(*) as c FROM cc_game_template_ingredients WHERE template_id = ?`, [defaultTplId]);
        if (Number((tplIngCount as any)[0].c) === 0) {
            const [ings] = await query<any>(`SELECT id FROM cc_ingredients WHERE activity_id = ? ORDER BY id ASC`, [ccActivityId]);
            const values = (ings as any[]).map((ing, idx) => [defaultTplId, Number(ing.id), idx]);
            if (values.length > 0) {
                await query<any>(
                    `INSERT INTO cc_game_template_ingredients (template_id, ingredient_id, \`order\`) VALUES ?`,
                    // @ts-ignore
                    [values]
                );
            }
        }

        // 8a. cc_rating_categories originally shipped without created_at/
        // updated_at even though the seed insert below always referenced them
        // — on a fresh install that threw and silently aborted every step
        // after it (caught by the outer try/catch, step 9 onward never ran).
        // Fixed at the CREATE TABLE above for brand-new installs; this catches
        // any database that already has the table from before this fix.
        const [ccRatingCreatedCol] = await query<any>(`SHOW COLUMNS FROM cc_rating_categories LIKE 'created_at'`);
        if ((ccRatingCreatedCol as any).length === 0) {
            await query(
                `ALTER TABLE cc_rating_categories ADD COLUMN created_at TIMESTAMP NULL DEFAULT NULL, ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL`
            );
        }

        // 9. Seed rating categories if empty
        const [ratingCount] = await query<any>(`SELECT COUNT(*) as c FROM cc_rating_categories`);
        if (Number((ratingCount as any)[0].c) === 0) {
            const ratings = [
                ['Most Creative Dish', 'most-creative', '🎨', 'The most creative and innovative dish!', 1],
                ['Funniest Dish', 'funniest-dish', '😂', 'The funniest dish or recipe!', 2],
                ['Most Confusing Dish', 'most-confusing', '🤯', 'The most confusing dish ever!', 3],
                ['Total Chaos Dish', 'total-chaos', '💥', 'Total chaos in the kitchen!', 4],
                ['What Did I Just Read?!', 'what-did-i-read', '😱', 'Most mind-boggling recipe!', 5],
                ['Least Edible Dish', 'least-edible', '🤢', 'The dish that sounds least edible!', 6],
                ['Too Spicy to Handle', 'too-spicy', '🌶️', 'Way too spicy or weird combinations!', 7],
                ['Weirdest Combination', 'weirdest-combination', '👽', 'The weirdest ingredient combinations!', 8],
                ['Taste Buds Destroyer', 'taste-buds-destroyer', '💀', 'Destroys taste buds guaranteed!', 9],
                ['MasterChef Level', 'masterchef-level', '👨‍🍳', 'The most professional & realistic recipe!', 10],
                ['Would Actually Eat This', 'would-eat-this', '😋', 'The dish you would actually try!', 11],
            ];
            const values = ratings.map((r) => [r[0], r[1], r[2], r[3], r[4], 'active', new Date(), new Date()]);
            await query<any>(
                `INSERT INTO cc_rating_categories (name, slug, emoji, description, \`order\`, status, created_at, updated_at) VALUES ?`,
                // @ts-ignore
                [values]
            );
        }

        // 10. Seed default clues if empty
        const [clueCount] = await query<any>(`SELECT COUNT(*) as c FROM cc_clues WHERE template_id = ?`, [defaultTplId]);
        if (Number((clueCount as any)[0].c) === 0) {
            const clues = [
                [defaultTplId, 1, 'Interesting — some absurd ingredients also received votes… someone in your group chose them.', 1],
                [defaultTplId, 2, 'The player who voted for the absurd ingredients is also the one who submitted that surprisingly bad cooking step…', 1],
                [defaultTplId, 3, 'The impostor also voted to keep their own bad step during the review phase.', 1],
            ];
            const values = clues.map((c) => [c[0], c[1], c[2], c[3]]);
            await query<any>(
                `INSERT INTO cc_clues (template_id, round_number, clue_text, \`order\`) VALUES ?`,
                // @ts-ignore
                [values]
            );
        }

        // 10a. Seed default game rules if empty — admin-editable from here on
        // (Laravel admin: Cook & Create > Templates); this is just the starting
        // set so the lobby isn't empty before an admin customizes them.
        const [ruleCount] = await query<any>(`SELECT COUNT(*) as c FROM cc_game_rules WHERE template_id = ?`, [defaultTplId]);
        if (Number((ruleCount as any)[0].c) === 0) {
            const rules = [
                'Play 3 rounds: Ingredients → Steps → Elimination.',
                'Select ingredients and submit one step, actions are time-bound.',
                'All actions are anonymous, observe patterns carefully.',
                'One player is the hidden Impostor trying to mislead the group.',
                'Use clues to identify suspicious actions.',
                'Vote wisely to eliminate the Impostor and win.',
            ];
            const values = rules.map((text, i) => [defaultTplId, text, i]);
            await query<any>(
                `INSERT INTO cc_game_rules (template_id, rule_text, \`order\`) VALUES ?`,
                // @ts-ignore
                [values]
            );
        }

        // 11. Round 2's submit/review sub-phase tracker (added after the initial
        // release — guarded the same way every other incremental column in this
        // file is).
        const [phaseCol] = await query<any>(`SHOW COLUMNS FROM cc_game_instances LIKE 'round2_phase'`);
        if ((phaseCol as any).length === 0) {
            await query(
                `ALTER TABLE cc_game_instances ADD COLUMN round2_phase ENUM('submit','review') NOT NULL DEFAULT 'submit' AFTER status`
            );
        }

        // 12. One nomination per (voter, rated group, category) — lets rating
        // submission use ON DUPLICATE KEY UPDATE to stay idempotent on re-taps.
        const [ratingKeyRows] = await query<any>(
            `SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cc_ratings' AND INDEX_NAME = 'unique_vote_per_category'`
        );
        if ((ratingKeyRows as any).length === 0) {
            await query(
                `ALTER TABLE cc_ratings ADD UNIQUE KEY unique_vote_per_category (voting_participant_id, rated_group_id, category_id)`
            );
        }

        // 13. Admin-uploadable background image for the Challenge Brief (pre-
        // Round-1) screen — falls back to the bundled default art on the
        // frontend when NULL.
        const [bgCol] = await query<any>(`SHOW COLUMNS FROM cc_game_templates LIKE 'background_image'`);
        if ((bgCol as any).length === 0) {
            await query(`ALTER TABLE cc_game_templates ADD COLUMN background_image VARCHAR(255) NULL DEFAULT NULL AFTER description`);
        }

        // 14. Round 3's "Double Down Moment" — the system secretly offers one
        // non-impostor voter double vote-weight, at the risk of a point
        // penalty if their target is wrong (see advanceRound3ToVoting /
        // finalizeRound3 in cookandcreateService.ts).
        const [ddCol] = await query<any>(`SHOW COLUMNS FROM cc_game_instances LIKE 'double_down_participant_id'`);
        if ((ddCol as any).length === 0) {
            await query(
                `ALTER TABLE cc_game_instances
                    ADD COLUMN double_down_participant_id BIGINT UNSIGNED NULL DEFAULT NULL,
                    ADD COLUMN double_down_status ENUM('offered','accepted','declined') NULL DEFAULT NULL`
            );
        }

        // 15. Per-template character portraits — same admin-uploadable/
        // fallback-to-bundled-art pattern as background_image, so different
        // Cook & Create games/templates can look visually distinct.
        const [portraitCol] = await query<any>(`SHOW COLUMNS FROM cc_game_templates LIKE 'chef1_image'`);
        if ((portraitCol as any).length === 0) {
            await query(
                `ALTER TABLE cc_game_templates
                    ADD COLUMN chef1_image VARCHAR(255) NULL DEFAULT NULL,
                    ADD COLUMN chef2_image VARCHAR(255) NULL DEFAULT NULL,
                    ADD COLUMN chef3_image VARCHAR(255) NULL DEFAULT NULL,
                    ADD COLUMN chef4_image VARCHAR(255) NULL DEFAULT NULL,
                    ADD COLUMN show_host_image VARCHAR(255) NULL DEFAULT NULL`
            );
        }

        // 16. Round 2's turn-based submission. Players write their cooking step
        // one at a time (Step A, then B, ...), each with their own countdown,
        // instead of everyone typing simultaneously. round2_turn_index is the
        // 0-based position in the group's join order whose turn it currently is;
        // round2_turn_started_at anchors that turn's countdown. NULL on both
        // means Round 2 hasn't started (or this is a pre-existing instance from
        // before turn-based submission, which finalizeRound1 seeds on entry).
        const [turnCol] = await query<any>(`SHOW COLUMNS FROM cc_game_instances LIKE 'round2_turn_index'`);
        if ((turnCol as any).length === 0) {
            await query(
                `ALTER TABLE cc_game_instances
                    ADD COLUMN round2_turn_index INT NULL DEFAULT NULL AFTER round2_phase,
                    ADD COLUMN round2_turn_started_at DATETIME NULL DEFAULT NULL AFTER round2_turn_index`
            );
        }

        // 17. The Round-2 turn order itself, as a JSON array of participant ids,
        // SHUFFLED once when Round 2 opens and never sent to any client.
        // It must NOT be the participant display order: step letters come from
        // turn position, so a derivable order would let everyone map "Step C" to
        // the 3rd player in the sidebar and unmask the impostor during review —
        // the exact opposite of the documented "steps appear with no names" rule.
        const [turnOrderCol] = await query<any>(`SHOW COLUMNS FROM cc_game_instances LIKE 'round2_turn_order'`);
        if ((turnOrderCol as any).length === 0) {
            await query(
                `ALTER TABLE cc_game_instances ADD COLUMN round2_turn_order TEXT NULL DEFAULT NULL AFTER round2_turn_started_at`
            );
        }

        // 18. When the review sub-phase actually opened. The review countdown
        // used to be measured from round2_started_at, which is when the whole of
        // Round 2 began — by the time every player has taken their turn that is
        // minutes in the past, so the review timer rendered 00:00 immediately.
        const [reviewStartCol] = await query<any>(
            `SHOW COLUMNS FROM cc_game_instances LIKE 'round2_review_started_at'`
        );
        if ((reviewStartCol as any).length === 0) {
            await query(
                `ALTER TABLE cc_game_instances ADD COLUMN round2_review_started_at DATETIME NULL DEFAULT NULL AFTER round2_turn_order`
            );
        }

    } catch (err: any) {
        console.warn('[schemaHelpers] Could not ensure Cook & Create schema:', err.message || err);
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
    await ensureCookAndCreateSchema();
}

export default ensureOrganizerStatusColumns;
