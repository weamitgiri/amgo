<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-uploadable image for each Full Story Reveal part, shown next to the part
 * title/body on the post-game results screen. Guarded with hasColumn so re-running
 * (or the Node API's boot schema sync) is safe.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('game_full_story', 'part_image')) {
            Schema::table('game_full_story', function (Blueprint $table) {
                $table->string('part_image')->nullable()->after('part_body');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('game_full_story', 'part_image')) {
            Schema::table('game_full_story', function (Blueprint $table) {
                $table->dropColumn('part_image');
            });
        }
    }
};
