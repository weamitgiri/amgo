<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-uploadable background image for the Challenge Brief (pre-Round-1)
 * screen — previously a bundled static asset. Guarded the same way as the
 * rest of the cc_* schema (safe no-op if the Node API already added this
 * column at boot — apis/src/utils/schemaHelpers.ts::ensureCookAndCreateSchema).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('cc_game_templates', 'background_image')) {
            Schema::table('cc_game_templates', function (Blueprint $table) {
                $table->string('background_image')->nullable()->after('description');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('cc_game_templates', 'background_image')) {
            Schema::table('cc_game_templates', function (Blueprint $table) {
                $table->dropColumn('background_image');
            });
        }
    }
};
