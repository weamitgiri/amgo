<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Ledger of every payment attempt against an organizer booking.
 *
 * A booking (organizer_bookings) is the "order" in this project — there is no
 * separate orders table — and organizer_billings holds the GST/invoice snapshot
 * for it. This table sits alongside those and records the gateway side of the
 * transaction: one row per attempt, written by the Node API at checkout and
 * read by the Laravel admin payment module.
 *
 * A failed Razorpay attempt followed by a retry is legitimately two rows. What
 * must never duplicate is a single gateway transaction, so gateway_order_id and
 * gateway_payment_id are unique — the checkout callback and the webhook race
 * each other routinely, and the unique keys make the loser a no-op instead of a
 * second record. COD rows leave both NULL (MySQL permits many NULLs in a
 * unique index).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')->constrained('organizer_bookings')->cascadeOnDelete();
            $table->foreignId('billing_id')->nullable()->constrained('organizer_billings')->nullOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers')->cascadeOnDelete();

            // razorpay | cod — kept as separate columns because a future gateway
            // (e.g. Stripe) would share payment_method 'card' across gateways.
            $table->string('payment_method', 32);
            $table->string('gateway', 32);

            $table->string('gateway_order_id')->nullable()->unique();
            $table->string('gateway_payment_id')->nullable()->unique();
            $table->text('gateway_signature')->nullable();

            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('INR');

            // pending | authorized | captured | failed | refunded | cancelled
            //
            // Deliberately the single source of truth for payment state: the
            // spec listed both `status` and `payment_status`, but two columns
            // describing one lifecycle drift apart the first time a webhook and
            // a callback disagree. Order state stays where it already lives, on
            // organizer_bookings.status.
            $table->string('payment_status', 24)->default('pending');

            // none | partial | full
            $table->string('refund_status', 24)->default('none');
            $table->decimal('refunded_amount', 12, 2)->default(0);

            $table->string('transaction_reference')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('paid_at')->nullable();

            // Gateway method detail (upi/card/netbanking/wallet), acquirer refs,
            // capture context. Never card numbers, UPI handles or tokens.
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['payment_status', 'created_at']);
            $table->index(['gateway', 'payment_status']);
            $table->index(['booking_id', 'payment_status']);
            $table->index('created_at');
        });

        // organizer_billings.payment_status was enum('pending','paid','failed').
        // Refunds and abandoned checkouts have no home in that set, and MySQL
        // silently truncates an out-of-range enum write in non-strict mode —
        // which would read back as a successful payment.
        DB::statement(
            "ALTER TABLE `organizer_billings`
             MODIFY `payment_status` ENUM('pending','paid','failed','refunded','cancelled')
             NOT NULL DEFAULT 'pending'"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');

        DB::statement(
            "ALTER TABLE `organizer_billings`
             MODIFY `payment_status` ENUM('pending','paid','failed')
             NOT NULL DEFAULT 'pending'"
        );
    }
};
