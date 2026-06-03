<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General settings
            'website_name' => 'Poll Application',
            'website_url' => 'https://example.com',
            'tagline' => 'Engage teams with smart game packages',
            'admin_email' => 'admin@example.com',
            'support_email' => 'support@example.com',
            'contact_number' => '+91-9999999999',
            'company_address' => 'Bengaluru, Karnataka, India',
            'timezone' => 'Asia/Kolkata',
            'date_format' => 'd M Y',
            'currency' => 'INR',

            // Branding
            'primary_color' => '#6f42c1',
            'secondary_color' => '#343a40',
            'button_color' => '#007bff',
            'logo' => '',
            'favicon' => '',
            'footer_logo' => '',
            'login_logo' => '',

            // SEO
            'meta_title' => 'Poll Application',
            'meta_description' => 'Interactive polls and package-based plans.',
            'meta_keywords' => 'poll, package, team games, engagement',
            'og_image' => '',
            'google_analytics_code' => '',
            'facebook_pixel_code' => '',

            // Email
            'mail_driver' => 'smtp',
            'smtp_host' => 'smtp.mailtrap.io',
            'smtp_port' => '587',
            'smtp_username' => 'smtp-user',
            'smtp_password' => 'smtp-password',
            'from_email' => 'no-reply@example.com',
            'from_name' => 'Poll App',

            // OTP
            'otp_expiry_time' => '300',
            'otp_resend_limit' => '3',
            'otp_retry_attempts' => '5',

            // Payment
            'razorpay_key_id' => '',
            'razorpay_key_secret' => '',
            'stripe_key' => '',
            'stripe_secret' => '',
            'payment_mode' => 'test',
            'payment_option_upi' => '1',
            'payment_option_card' => '1',
            'payment_option_net_banking' => '1',
        ];

        foreach ($settings as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => (string) $value]
            );
        }
    }
}
