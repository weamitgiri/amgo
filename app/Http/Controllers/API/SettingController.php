<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends BaseController
{
    public function getGlobalSettings()
    {
        try {
            $settings = Cache::remember('global_settings', 3600, function () {
                return [
                    'website' => [
                        'name' => setting('website_name'),
                        'url' => setting('website_url'),
                        'tagline' => setting('tagline'),
                        'logo' => asset('storage/' . setting('site_logo')),
                        'footer_logo' => asset('storage/' . setting('footer_logo')),
                        'favicon' => asset('storage/' . setting('favicon')),
                    ],
                    'contact' => [
                        'admin_email' => setting('admin_email'),
                        'support_email' => setting('support_email'),
                        'phone' => setting('contact_number'),
                        'whatsapp' => setting('whatsapp_number'),
                        'address' => setting('company_address'),
                    ],
                    'social_links' => [
                        'facebook' => setting('facebook_url'),
                        'instagram' => setting('instagram_url'),
                        'twitter' => setting('twitter_url'),
                        'linkedin' => setting('linkedin_url'),
                        'youtube' => setting('youtube_url'),
                    ],
                    'localization' => [
                        'timezone' => setting('timezone', 'Asia/Kolkata'),
                        'date_format' => setting('date_format', 'd M Y'),
                        'currency' => setting('currency', 'INR'),
                    ]
                ];
            });

            return $this->successResponse($settings, 'Global settings fetched successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch settings', ['error' => $e->getMessage()]);
        }
    }
}
