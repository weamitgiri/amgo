<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('package_purchases')) {
            return;
        }

        Schema::create('package_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained('packages')->cascadeOnUpdate()->restrictOnDelete();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->decimal('amount', 12, 2)->default(0);
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['package_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_purchases');
    }
};
