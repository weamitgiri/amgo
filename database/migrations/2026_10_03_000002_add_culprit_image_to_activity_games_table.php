<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-uploadable image for the Hidden Culprit reveal on the post-game results
 * screen ("The hidden Culprit was ..."). Falls back to the culprit role's portrait
 * when not set. Guarded with hasColumn so re-running / API boot sync is safe.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('activity_games', 'culprit_image')) {
            Schema::table('activity_games', function (Blueprint $table) {
                $table->string('culprit_image')->nullable()->after('victim_name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('activity_games', 'culprit_image')) {
            Schema::table('activity_games', function (Blueprint $table) {
                $table->dropColumn('culprit_image');
            });
        }
    }
};
