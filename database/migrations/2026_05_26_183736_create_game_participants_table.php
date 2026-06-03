<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('organizer_bookings')->cascadeOnDelete();
            $table->foreignId('game_id')->constrained('activity_games')->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('otp', 6)->nullable();
            $table->timestamp('otp_expires_at')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('join_token')->unique();
            $table->enum('status', ['joined', 'playing', 'finished'])->default('joined');
            $table->timestamps();
        });

        Schema::table('organizer_bookings', function (Blueprint $table) {
            $table->string('invitation_link')->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_participants');
        Schema::table('organizer_bookings', function (Blueprint $table) {
            $table->dropColumn('invitation_link');
        });
    }
};
