<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Stores the path of the auto-generated Cook & Create awards results PDF on the
 * group. Unlike results_pdf_path (Mystery Quest, purged after 1 hour), this one
 * is kept permanently so authorised HR users can download it any time. Guarded
 * so it is a safe no-op if the Node API already added it at boot
 * (apis/src/utils/schemaHelpers.ts).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('game_groups', 'cc_results_pdf_path')) {
            DB::statement('ALTER TABLE game_groups ADD COLUMN cc_results_pdf_path VARCHAR(255) NULL DEFAULT NULL AFTER results_pdf_expires_at');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('game_groups', 'cc_results_pdf_path')) {
            DB::statement('ALTER TABLE game_groups DROP COLUMN cc_results_pdf_path');
        }
    }
};
