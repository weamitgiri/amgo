<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-uploadable role icon (60×60 badge) shown on the player's own "Your Role"
 * card, alongside the existing full-size role_image portrait. Guarded with
 * hasColumn because the Node API also adds this column on boot.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('game_roles', 'role_icon')) {
            Schema::table('game_roles', function (Blueprint $table) {
                $table->string('role_icon')->nullable()->after('role_image');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('game_roles', 'role_icon')) {
            Schema::table('game_roles', function (Blueprint $table) {
                $table->dropColumn('role_icon');
            });
        }
    }
};
