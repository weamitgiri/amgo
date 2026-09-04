<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Removes gateway credentials from the `settings` table and seeds the payment
 * behaviour flags in their place.
 *
 * The settings table is read by GET /v1/public/settings, which until now
 * returned every row unfiltered — so anything stored here was public. That
 * endpoint is now allowlisted, but the credentials should not be in a
 * browser-reachable table at all: they belong in .env, which is where both the
 * Node checkout API and config/services.php read them from.
 *
 * IMPORTANT: deleting these rows does not undo the exposure. Any Razorpay or
 * Stripe key that was stored here must be treated as compromised and rotated in
 * the respective dashboard, then set in .env. The same applies to smtp_password,
 * which was served by the same endpoint — this migration leaves it in place
 * because mail delivery reads it, but it should be rotated too.
 */
return new class extends Migration
{
    /** Credential keys that must not live in a browser-reachable table. */
    private const CREDENTIAL_KEYS = [
        'razorpay_key_id',
        'razorpay_key_secret',
        'stripe_key',
        'stripe_secret',
    ];

    public function up(): void
    {
        DB::table('settings')->whereIn('key', self::CREDENTIAL_KEYS)->delete();

        // Defaults for the flags the checkout API reads. Razorpay defaults on
        // (it still needs credentials before it will show); COD defaults off,
        // so enabling it is a deliberate act rather than a side effect of
        // running a migration.
        $defaults = [
            'payment_gateway_razorpay_enabled' => '1',
            'payment_gateway_cod_enabled' => '0',
            'payment_cod_min_amount' => '0',
            'payment_cod_max_amount' => '0',
            'payment_option_wallet' => '1',
        ];

        foreach ($defaults as $key => $value) {
            // insertOrIgnore-style guard: never clobber a value an admin has
            // already set if this migration is re-run on a restored database.
            $exists = DB::table('settings')->where('key', $key)->exists();

            if (! $exists) {
                DB::table('settings')->insert(['key' => $key, 'value' => $value]);
            }
        }
    }

    public function down(): void
    {
        // Intentionally does not restore the deleted credentials — they are not
        // retained anywhere, and recreating them would reintroduce the leak.
        DB::table('settings')->whereIn('key', [
            'payment_gateway_razorpay_enabled',
            'payment_gateway_cod_enabled',
            'payment_cod_min_amount',
            'payment_cod_max_amount',
            'payment_option_wallet',
        ])->delete();
    }
};
