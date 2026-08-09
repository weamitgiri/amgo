<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cook & Create's lobby "Game Rules" list was hardcoded in the frontend.
 * This makes it admin-editable per template, the same way Mystery Quest's
 * game_rules table already works for its own lobby (apis/src/services/
 * lobbyService.ts). Guarded the same way as the rest of the cc_* schema, so
 * it's a safe no-op if the Node API already created this table at boot
 * (apis/src/utils/schemaHelpers.ts::ensureCookAndCreateSchema).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('cc_game_rules')) {
            Schema::create('cc_game_rules', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('template_id');
                $table->text('rule_text');
                $table->unsignedInteger('order')->default(0);
                $table->index('template_id');
            });
        }
    }

    public function down(): void
    {
        // No drop — see the note on the sibling cc_* migration: the Node API
        // depends on this table and may still be running.
    }
};
