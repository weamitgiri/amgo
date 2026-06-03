<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizers', function (Blueprint $table) {
            if (!Schema::hasColumn('organizers', 'designation')) {
                $table->string('designation')->nullable()->after('company_website');
            }
            if (!Schema::hasColumn('organizers', 'phone')) {
                $table->string('phone', 30)->nullable()->after('designation');
            }
        });
    }

    public function down(): void
    {
        Schema::table('organizers', function (Blueprint $table) {
            if (Schema::hasColumn('organizers', 'phone')) {
                $table->dropColumn('phone');
            }
            if (Schema::hasColumn('organizers', 'designation')) {
                $table->dropColumn('designation');
            }
        });
    }
};
