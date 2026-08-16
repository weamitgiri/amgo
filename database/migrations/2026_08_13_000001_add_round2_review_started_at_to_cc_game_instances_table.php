<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Records when Round 2's review sub-phase opened.
 *
 * The review countdown was previously measured from round2_started_at — the
 * start of the whole of Round 2. Since every player now takes a timed turn
 * before review begins, that timestamp is several minutes stale by then and the
 * review timer rendered 00:00 the moment it appeared.
 *
 * Guarded like every other Cook & Create migration here: the Node API's
 * schemaHelpers.ts adds the same column at boot and either side may run first.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('cc_game_instances')) {
            return;
        }

        Schema::table('cc_game_instances', function (Blueprint $table) {
            if (! Schema::hasColumn('cc_game_instances', 'round2_review_started_at')) {
                $table->dateTime('round2_review_started_at')->nullable()->default(null);
            }
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('cc_game_instances') && Schema::hasColumn('cc_game_instances', 'round2_review_started_at')) {
            Schema::table('cc_game_instances', function (Blueprint $table) {
                $table->dropColumn('round2_review_started_at');
            });
        }
    }
};
