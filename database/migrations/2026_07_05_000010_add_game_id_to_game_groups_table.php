<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Each group is assigned exactly one game from its activity's game pool
     * (round-robin when the activity has multiple games). Stored per group so
     * every participant in the same group always receives the same game.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('game_groups', 'game_id')) {
            Schema::table('game_groups', function (Blueprint $table) {
                $table->unsignedBigInteger('game_id')->nullable()->after('booking_id');
            });
        }

        // Backfill existing groups from the booking-level game so pre-existing
        // sessions keep resolving the same game they were playing.
        DB::statement('
            UPDATE game_groups gg
            JOIN organizer_bookings ob ON gg.booking_id = ob.id
            SET gg.game_id = ob.game_id
            WHERE gg.game_id IS NULL AND ob.game_id IS NOT NULL
        ');
    }

    public function down(): void
    {
        if (Schema::hasColumn('game_groups', 'game_id')) {
            Schema::table('game_groups', function (Blueprint $table) {
                $table->dropColumn('game_id');
            });
        }
    }
};
