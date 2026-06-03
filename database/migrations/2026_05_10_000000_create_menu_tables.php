<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('menu')) {
            Schema::create('menu', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->text('link')->nullable();
                $table->integer('parent_id')->default(0);
                $table->string('icon')->nullable();
                $table->enum('status', ['Active', 'Inactive'])->default('Active');
                $table->string('table_type')->nullable();
                $table->integer('order')->nullable();
                $table->integer('single_route')->nullable();
                $table->integer('permission_type')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (!Schema::hasTable('menu_permissions')) {
            Schema::create('menu_permissions', function (Blueprint $table) {
                $table->id();
                $table->integer('manager_id')->nullable();
                $table->integer('manager_action_id')->nullable();
                $table->string('name');
                $table->string('showing_name');
                $table->string('guard_name')->default('web');
                $table->enum('status', ['0', '1'])->default('1');
                $table->enum('permission_type', ['0', '1', '2'])->default('2');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_permissions');
        Schema::dropIfExists('menu');
    }
};
