<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Cook & Create results review = one row per (voting_participant, rated_group)
 * holding BOTH the emoji reaction (category_id) and the 1–5 star rating (stars).
 *
 *  - stars:        the new 1–5 star rating (nullable until the player sets it).
 *  - category_id:  made nullable so a player can save a star before an emoji
 *                  (either order), the review completing once both are present.
 *  - unique key:   switched from (participant, group, category) to
 *                  (participant, group) so there is exactly one review row per
 *                  other group — this also keeps reaction counts from being
 *                  inflated by multiple category rows.
 *
 * Guarded so it is a safe no-op if the Node API already applied the same
 * changes at boot (apis/src/utils/schemaHelpers.ts).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('cc_ratings', 'stars')) {
            DB::statement('ALTER TABLE cc_ratings ADD COLUMN stars TINYINT UNSIGNED NULL AFTER category_id');
        }
        // Make category_id nullable (safe to re-run).
        DB::statement('ALTER TABLE cc_ratings MODIFY COLUMN category_id BIGINT UNSIGNED NULL');

        // Swap the per-category unique for a per-review unique, if not already done.
        $hasOld = collect(DB::select("SHOW INDEX FROM cc_ratings WHERE Key_name = 'unique_vote_per_category'"))->isNotEmpty();
        $hasNew = collect(DB::select("SHOW INDEX FROM cc_ratings WHERE Key_name = 'unique_review'"))->isNotEmpty();
        if ($hasOld) {
            DB::statement('ALTER TABLE cc_ratings DROP INDEX unique_vote_per_category');
        }
        if (!$hasNew) {
            DB::statement('ALTER TABLE cc_ratings ADD UNIQUE KEY unique_review (voting_participant_id, rated_group_id)');
        }
    }

    public function down(): void
    {
        if (collect(DB::select("SHOW INDEX FROM cc_ratings WHERE Key_name = 'unique_review'"))->isNotEmpty()) {
            DB::statement('ALTER TABLE cc_ratings DROP INDEX unique_review');
        }
        if (collect(DB::select("SHOW INDEX FROM cc_ratings WHERE Key_name = 'unique_vote_per_category'"))->isEmpty()) {
            DB::statement('ALTER TABLE cc_ratings ADD UNIQUE KEY unique_vote_per_category (voting_participant_id, rated_group_id, category_id)');
        }
        if (Schema::hasColumn('cc_ratings', 'stars')) {
            DB::statement('ALTER TABLE cc_ratings DROP COLUMN stars');
        }
    }
};
