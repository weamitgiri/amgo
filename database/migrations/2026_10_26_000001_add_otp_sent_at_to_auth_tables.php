<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tracks when the last OTP was issued, so the Node API can enforce a resend
 * cooldown (a user cannot request a new OTP within the cooldown window). This
 * is separate from otp_expires_at (how long a code stays valid).
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (['organizers', 'game_participants'] as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'otp_sent_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->timestamp('otp_sent_at')->nullable()->after('otp_expires_at');
                });
            }
        }
    }

    public function down(): void
    {
        foreach (['organizers', 'game_participants'] as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'otp_sent_at')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->dropColumn('otp_sent_at');
                });
            }
        }
    }
};
