<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Round 2 submission is turn-based: each player writes their cooking step in
 * turn (Step A, then B, ...), with their own countdown, instead of everyone
 * typing at once.
 *
 * Guarded the same way every other Cook & Create migration in this folder is —
 * the Node API's schemaHelpers.ts adds these same columns at boot, and either
 * side may run first depending on the environment.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('cc_game_instances')) {
            return;
        }

        Schema::table('cc_game_instances', function (Blueprint $table) {
            if (! Schema::hasColumn('cc_game_instances', 'round2_turn_index')) {
                $table->integer('round2_turn_index')->nullable()->default(null)->after('round2_phase');
            }
            if (! Schema::hasColumn('cc_game_instances', 'round2_turn_started_at')) {
                $table->dateTime('round2_turn_started_at')->nullable()->default(null)->after('round2_turn_index');
            }
            // Shuffled JSON array of participant ids — server-side only. Never
            // the display order: step letters come from turn position, so a
            // derivable order would unmask who wrote which step during review.
            if (! Schema::hasColumn('cc_game_instances', 'round2_turn_order')) {
                $table->text('round2_turn_order')->nullable()->default(null)->after('round2_turn_started_at');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('cc_game_instances')) {
            return;
        }

        Schema::table('cc_game_instances', function (Blueprint $table) {
            foreach (['round2_turn_index', 'round2_turn_started_at'] as $column) {
                if (Schema::hasColumn('cc_game_instances', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
