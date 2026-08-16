<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Round 3's "Double Down Moment" — the system secretly offers one
 * non-impostor voter double vote-weight, at the risk of a -50 point penalty
 * if their target is wrong. See apis/src/services/cookandcreateService.ts
 * (offerDoubleDown / respondToDoubleDown / finalizeRound3). Guarded the same
 * way as the rest of the cc_* schema — safe no-op if the Node API already
 * added these columns at boot.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('cc_game_instances', 'double_down_participant_id')) {
            Schema::table('cc_game_instances', function (Blueprint $table) {
                $table->unsignedBigInteger('double_down_participant_id')->nullable();
                $table->enum('double_down_status', ['offered', 'accepted', 'declined'])->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('cc_game_instances', 'double_down_participant_id')) {
            Schema::table('cc_game_instances', function (Blueprint $table) {
                $table->dropColumn(['double_down_participant_id', 'double_down_status']);
            });
        }
    }
};
