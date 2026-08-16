<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-template character portraits — same admin-uploadable/fallback-to-
 * bundled-art pattern as background_image (2026_08_09_000001_...), so
 * different Cook & Create games can look visually distinct instead of every
 * template sharing the same bundled chef/show-host art.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('cc_game_templates', 'chef1_image')) {
            Schema::table('cc_game_templates', function (Blueprint $table) {
                $table->string('chef1_image')->nullable();
                $table->string('chef2_image')->nullable();
                $table->string('chef3_image')->nullable();
                $table->string('chef4_image')->nullable();
                $table->string('show_host_image')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('cc_game_templates', 'chef1_image')) {
            Schema::table('cc_game_templates', function (Blueprint $table) {
                $table->dropColumn(['chef1_image', 'chef2_image', 'chef3_image', 'chef4_image', 'show_host_image']);
            });
        }
    }
};
