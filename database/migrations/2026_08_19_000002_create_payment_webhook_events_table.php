<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Idempotency ledger for inbound gateway webhooks.
 *
 * Razorpay retries a webhook until it gets a 2xx, and will happily deliver the
 * same event more than once even after a success. Every delivery carries a
 * stable `x-razorpay-event-id`; inserting it under a unique key *before* doing
 * any work turns a redelivery into a duplicate-key error the handler can
 * swallow, so an order is never credited twice.
 *
 * It doubles as an audit trail — payload retained for support, signature and
 * secrets never stored.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_webhook_events', function (Blueprint $table) {
            $table->id();

            $table->string('gateway', 32)->default('razorpay');
            $table->string('event_id')->unique();
            $table->string('event_type', 64);

            $table->foreignId('payment_id')->nullable()->constrained('payments')->nullOnDelete();

            // received | processed | ignored | failed
            $table->string('status', 24)->default('received');
            $table->json('payload')->nullable();
            $table->text('error')->nullable();

            $table->timestamps();

            $table->index(['event_type', 'created_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_webhook_events');
    }
};
