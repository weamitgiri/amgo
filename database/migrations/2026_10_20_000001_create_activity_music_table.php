<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Music Manager: background tracks uploaded in the admin panel and assigned to a
 * game activity. The website plays the activity's active track during the game
 * (Node API: GET /v1/public/activities/:activity/music). At most one track per
 * activity is active; the admin controller deactivates the others on activate.
 * Files live on the public disk under activity-music/.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('activity_music')) {
            Schema::create('activity_music', function (Blueprint $table) {
                $table->id();
                $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
                $table->string('title', 150);
                $table->string('file_path');
                $table->string('original_name')->nullable();
                $table->string('mime_type', 100)->nullable();
                $table->unsignedInteger('file_size')->default(0);
                $table->boolean('status')->default(true);
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();
                $table->timestamps();

                $table->index(['activity_id', 'status']);
            });
        }

        // Sidebar entry (idempotent, same pattern as the API-logs menu migration).
        $exists = DB::table('menu')->where('link', 'admin/music')->exists();
        if (!$exists) {
            DB::table('menu')->insert([
                'name' => 'Music Manager',
                'link' => 'admin/music',
                'parent_id' => 0,
                'icon' => 'fas fa-music',
                'status' => 'Active',
                'order' => 8,
                'permission_type' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('menu')->where('link', 'admin/music')->delete();
        Schema::dropIfExists('activity_music');
    }
};
