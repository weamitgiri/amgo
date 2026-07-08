<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** Sidebar entry for the admin API-logs viewer (idempotent). */
    public function up(): void
    {
        $exists = DB::table('menu')->where('link', 'admin/api-logs')->exists();
        if (!$exists) {
            DB::table('menu')->insert([
                'name' => 'API Logs',
                'link' => 'admin/api-logs',
                'parent_id' => 0,
                'icon' => 'fas fa-file-medical-alt',
                'status' => 'Active',
                'order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('menu')->where('link', 'admin/api-logs')->delete();
    }
};
