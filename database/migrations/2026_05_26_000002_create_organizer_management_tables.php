<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Organizers Table
        Schema::create('organizers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('company_name');
            $table->string('company_website')->nullable();
            $table->string('otp')->nullable();
            $table->timestamp('otp_expires_at')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->enum('account_status', ['pending', 'active', 'inactive'])->default('pending');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Organizer Bookings Table
        Schema::create('organizer_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers')->cascadeOnDelete();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->foreignId('game_id')->nullable()->constrained('activity_games')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained('packages')->cascadeOnDelete();
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->enum('status', ['pending_activation', 'active', 'completed', 'expired'])->default('pending_activation');
            $table->timestamps();
        });

        // 3. Organizer Billings Table
        Schema::create('organizer_billings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('organizer_bookings')->cascadeOnDelete();
            $table->string('gst_number')->nullable();
            $table->text('billing_address');
            $table->string('city');
            $table->string('state');
            $table->string('pin_code');
            $table->decimal('package_price', 12, 2);
            $table->decimal('taxes', 12, 2)->default(0);
            $table->decimal('additional_charges', 12, 2)->default(0);
            $table->decimal('gst_amount', 12, 2)->default(0);
            $table->decimal('total_payable', 12, 2);
            $table->string('payment_method')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->json('confirmation_details')->nullable(); // For the checkboxes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizer_billings');
        Schema::dropIfExists('organizer_bookings');
        Schema::dropIfExists('organizers');
    }
};
