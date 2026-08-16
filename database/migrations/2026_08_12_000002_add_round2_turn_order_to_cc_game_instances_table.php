<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The Round-2 turn order itself: a shuffled JSON array of participant ids,
 * fixed once when Round 2 opens and never sent to any client.
 *
 * It deliberately is NOT the participant display order. A step's letter comes
 * from its author's turn position, so a derivable order would let every player
 * map "Step C" to the third name in the sidebar and identify the impostor
 * during review — the opposite of the game's "steps appear with no names" rule.
 *
 * Split out from 2026_08_12_000001 (which carries the same guard for fresh
 * installs) so databases that already ran that migration still pick this up.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('cc_game_instances')) {
            return;
        }

        Schema::table('cc_game_instances', function (Blueprint $table) {
            if (! Schema::hasColumn('cc_game_instances', 'round2_turn_order')) {
                $table->text('round2_turn_order')->nullable()->default(null);
            }
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('cc_game_instances') && Schema::hasColumn('cc_game_instances', 'round2_turn_order')) {
            Schema::table('cc_game_instances', function (Blueprint $table) {
                $table->dropColumn('round2_turn_order');
            });
        }
    }
};
