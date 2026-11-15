export declare function ensureOrganizerStatusColumns(): Promise<void>;
export declare function ensureGameGroupRetentionColumns(): Promise<void>;
export declare function ensureParticipantSessionsLeftAt(): Promise<void>;
export declare function ensureTimersReferenceId(): Promise<void>;
export declare function ensureVotesTable(): Promise<void>;
export declare function ensureGroupAccusationsTable(): Promise<void>;
export declare function ensureResultsScoringColumns(): Promise<void>;
export declare function ensureActivityGamesVictimName(): Promise<void>;
/**
 * game_roles.role_icon — the small (60×60) badge image shown on the player's own
 * "Your Role" card, uploaded per role in the admin wizard. The Laravel migration
 * adds it too; this guard exists because gameSummaryService SELECTs the column,
 * so a deploy that forgot `php artisan migrate` would otherwise break every game.
 */
export declare function ensureGameRolesRoleIcon(): Promise<void>;
/**
 * "Equal Chance" scoring columns on activities (Scoreboard Logic PDF). The verdict
 * service SELECTs these; the Laravel migration adds them too, so this guard keeps a
 * deploy that skipped `php artisan migrate` from breaking end-game scoring.
 */
export declare function ensureEqualChanceScoringColumns(): Promise<void>;
/**
 * Mystery Quest scoreboard — the FINAL source of truth (see the scoring spec).
 * These values are fixed and shown read-only in the admin panel, so we enforce
 * them on boot for the mystery-quest activity. This keeps the backend scoring in
 * step with the spec even on a deploy that skipped a migration, and makes the
 * read-only admin values authoritative everywhere. Only the mystery-quest row is
 * touched — Cook & Create and every other activity are left untouched.
 */
export declare function ensureMysteryQuestScoreboardValues(): Promise<void>;
/**
 * activity_games.culprit_image — the image shown for the Hidden Culprit reveal on
 * the results screen, uploaded in the admin wizard. The Laravel migration adds it
 * too; this guard exists because the results endpoint SELECTs the column.
 */
export declare function ensureActivityGamesCulpritImage(): Promise<void>;
/**
 * game_full_story.part_image — the image shown next to each Full Story Reveal part
 * on the results screen, uploaded per part in the admin wizard. The Laravel
 * migration adds it too; this guard exists because the results endpoint SELECTs
 * the column, so a deploy that forgot `php artisan migrate` would break results.
 */
export declare function ensureFullStoryPartImage(): Promise<void>;
export declare function ensureGameDurationDefault(): Promise<void>;
export declare function ensureGameGroupsGameId(): Promise<void>;
export declare function ensureCookAndCreateSchema(): Promise<void>;
/**
 * Global Cook & Create stage durations (cc_stage_durations, single row id = 1)
 * and the per-game snapshot column (cc_game_instances.stage_durations) — see
 * services/ccStageDurations.ts. Existing games are backfilled from their own
 * template BEFORE the global values are first applied to every template, so a
 * game already running keeps its durations. Same steps, same order, as the
 * Laravel migration 2026_10_18_000001; whichever runs first wins.
 */
export declare function ensureCCStageDurations(): Promise<void>;
export declare function ensureGameSchemaUpdates(): Promise<void>;
export default ensureOrganizerStatusColumns;
