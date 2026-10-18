<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-uploadable case summary image, shown beside the case plot on the
 * in-game case summary. When empty the game falls back to its built-in collage.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('activity_games', 'case_summary_image')) {
            Schema::table('activity_games', function (Blueprint $table) {
                $table->string('case_summary_image')->nullable()->after('bg_image');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('activity_games', 'case_summary_image')) {
            Schema::table('activity_games', function (Blueprint $table) {
                $table->dropColumn('case_summary_image');
            });
        }
    }
};
