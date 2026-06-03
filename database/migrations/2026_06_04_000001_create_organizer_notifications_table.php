<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizer_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('organizer_bookings')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers')->cascadeOnDelete();
            $table->string('type', 50);
            $table->text('message');
            $table->string('dot_color', 20)->default('emerald');
            $table->unsignedBigInteger('participant_id')->nullable();
            $table->unsignedBigInteger('group_id')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['booking_id', 'organizer_id', 'is_read']);
            $table->index(['booking_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizer_notifications');
    }
};
