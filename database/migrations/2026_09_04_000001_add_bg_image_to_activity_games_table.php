<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-uploadable case background image, shown behind the lobby case card
 * (and the in-game case summary). Stored on the public disk like the other
 * game images (roles, clues, photos).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('activity_games', 'bg_image')) {
            Schema::table('activity_games', function (Blueprint $table) {
                $table->string('bg_image')->nullable()->after('tagline');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('activity_games', 'bg_image')) {
            Schema::table('activity_games', function (Blueprint $table) {
                $table->dropColumn('bg_image');
            });
        }
    }
};
