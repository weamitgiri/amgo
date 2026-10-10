<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-configurable durations for the three Cook & Create stages that were
 * previously fixed in the frontend or untimed:
 *   - role_brief_secs:     Secret Role / Challenge Brief reading (default 5 min)
 *   - round1_results_secs: Ingredient Selection results popup   (default 1 min)
 *   - dish_naming_secs:    Dish Naming                          (default 1 min)
 *
 * The other six stage durations already have columns (round1_timer_secs,
 * round2_submit_timer_secs, round2_review_timer_secs, round3_discussion_timer_secs,
 * round3_voting_timer_secs) or live on the activity (lobby_wait_secs).
 *
 * Guarded the same way as the rest of the cc_* schema (safe no-op if the Node
 * API already added these at boot — apis/src/utils/schemaHelpers.ts).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cc_game_templates', function (Blueprint $table) {
            if (!Schema::hasColumn('cc_game_templates', 'role_brief_secs')) {
                $table->unsignedInteger('role_brief_secs')->default(300)->after('round3_max_messages_per_player');
            }
            if (!Schema::hasColumn('cc_game_templates', 'round1_results_secs')) {
                $table->unsignedInteger('round1_results_secs')->default(60)->after('round1_timer_secs');
            }
            if (!Schema::hasColumn('cc_game_templates', 'dish_naming_secs')) {
                $table->unsignedInteger('dish_naming_secs')->default(60)->after('round2_review_timer_secs');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cc_game_templates', function (Blueprint $table) {
            foreach (['role_brief_secs', 'round1_results_secs', 'dish_naming_secs'] as $col) {
                if (Schema::hasColumn('cc_game_templates', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
