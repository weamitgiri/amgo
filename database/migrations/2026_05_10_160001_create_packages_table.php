<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price', 12, 2)->default(0);
            $table->unsignedBigInteger('max_users')->default(0);
            $table->unsignedBigInteger('total_groups')->default(0);
            $table->unsignedBigInteger('validity_days');
            $table->text('short_description')->nullable();
            $table->json('features')->nullable();
            $table->json('game_access')->nullable();
            $table->enum('status', ['active', 'inactive', 'draft'])->default('draft');
            $table->unsignedBigInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
