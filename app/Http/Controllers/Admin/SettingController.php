<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Contracts\Encryption\DecryptException;
use Validator;
use App\Models\User;
use DataTables;
use Setting;

use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Support\Facades\File;


class SettingController extends Controller {

     private $user;
     use ValidatesRequests;


     public function __construct(User $user){
        $this->user         = $user;
     }

    //Site Setting --------
    public function index()
    {
          
         return view('admin.setting.websetting');
    }

    // Site Setting Update----
    public function siteSettingUpdate(Request $request)
    {
        try {

        $settingArray = Validator::make($request->all(), [
            "website_name" => "required|string|max:120",
            "website_url" => "required|url|max:255",
            "tagline" => "nullable|string|max:255",
            "admin_email" => "required|email|max:120",
            "support_email" => "required|email|max:120",
            "contact_number" => "required|string|max:20",
            "company_address" => "required|string|max:500",
            "timezone" => "required|string|max:100",
            "date_format" => "required|string|max:50",
            "currency" => "required|string|max:10",
        ]);
        if ($settingArray->fails()) {
            return response()->json($settingArray->messages(), 422);
        }else{
            $niceNames = [];
             $settingArray = $this->validate($request, $this->siteValidateArray(), [], $niceNames);

        }
            foreach ($settingArray as $key => $setting) {
                $settingArray[$key] = strip_tags($setting);
            }
            Setting::set($settingArray);
            Setting::save();
            

            $response["status"] = "success";
            $response["reload"] = true;
            $response["message"] = "General settings updated successfully.";
            return json_encode($response);
            // return back()->with('success','The Site setting updated successfully.');
            } catch (ValidationException $exception) {
                return response()->json($exception->errors(), 422);
            }
    }

    private function siteValidateArray()
    {
        return [
            "website_name" => "required|string|max:120",
            "website_url" => "required|url|max:255",
            "tagline" => "nullable|string|max:255",
            "admin_email" => "required|email|max:120",
            "support_email" => "required|email|max:120",
            "contact_number" => "required|string|max:20",
            "company_address" => "required|string|max:500",
            "timezone" => "required|string|max:100",
            "date_format" => "required|string|max:50",
            "currency" => "required|string|max:10",
        ];
    } 

// =====================================================================
    public function linkupdateSettings(Request $request)
    {
        try {

        $settingArray = Validator::make($request->all(), [
             
            'facebook_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?facebook\.com$/i'],
            'instagram_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?instagram\.com$/i'],
            'twitter_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?twitter\.com$/i'],
            'linkedin_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?linkedin\.com$/i'],
            'youtube_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?youtube\.com$/i'],
            'rss_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?rss\.com$/i'],
            'yelp_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?yelp\.com$/i'],
            'vimeo_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?vimeo\.com$/i'],        ]);
        if ($settingArray->fails()) {
            return response()->json($settingArray->messages(), 422);
        }else{
            $niceNames = [];
             $settingArray = $this->validate($request, $this->siteValidateArrayLinks(), [], $niceNames);

        }
            foreach ($settingArray as $key => $setting) {
                $settingArray[$key] = strip_tags($setting);
            }


            Setting::set($settingArray);
            Setting::save();

            $response["status"] = "success";
            //$response["resetform"] = true;
            $response["reload"] = true;
            $response["message"] = "The Social Links setting updated successfully.";
            return json_encode($response);
            // return back()->with('success','The Site setting updated successfully.');
            } catch (ValidationException $exception) {
                return response()->json($exception->errors(), 422);
            }
    }

    private function siteValidateArrayLinks()
    {
        return [
            'facebook_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?facebook\.com$/i'],
            'instagram_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?instagram\.com$/i'],
            'twitter_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?twitter\.com$/i'],
            'linkedin_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?linkedin\.com$/i'],
            'youtube_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?youtube\.com$/i'],
            'rss_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?rss\.com$/i'],
            'yelp_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?yelp\.com$/i'],
            'vimeo_link' => ['required', 'string', 'regex:/^(https?:\/\/)?(www\.)?vimeo\.com$/i'],         ];
    }
// =====================================================================

    public function SeoupdateSettings(Request $request)
    {
        try {

        $settingArray = Validator::make($request->all(), [
            'meta_title' => 'required|string|max:255',
            'meta_keywords' => 'required|string|max:500',
            'meta_description' => 'required|string|max:500',
            'google_analytics_code' => 'nullable|string',
            'facebook_pixel_code' => 'nullable|string',
            'og_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);
        if ($settingArray->fails()) {
            return response()->json($settingArray->messages(), 422);
        }else{
            $niceNames = [];
             $settingArray = $this->validate($request, $this->siteValidateArraySeo(), [], $niceNames);

        }
            foreach ($settingArray as $key => $setting) {
                $settingArray[$key] = is_string($setting) ? strip_tags($setting) : $setting;
            }

            if ($request->hasFile('og_image')) {
                $settingArray['og_image'] = $this->storeLogoAsset($request->file('og_image'), 'og_image');
            } else {
                unset($settingArray['og_image']);
            }

            Setting::set($settingArray);
            Setting::save();

            $response["status"] = "success";
            //$response["resetform"] = true;
            $response["reload"] = true;
            $response["message"] = "The SEO setting updated successfully.";
            return json_encode($response);
            // return back()->with('success','The Site setting updated successfully.');
            } catch (ValidationException $exception) {
                return response()->json($exception->errors(), 422);
            }
        }

         private function siteValidateArraySeo()
    {
        return [
            'meta_title' => 'required|string|max:255',
            'meta_keywords' => 'required|string|max:500',
            'meta_description' => 'required|string|max:500',
            'google_analytics_code' => 'nullable|string',
            'facebook_pixel_code' => 'nullable|string',
            'og_image' => 'nullable|string',
         ];
    } 

    public function brandingUpdate(Request $request)
    {
        $validated = $request->validate([
            'primary_color' => 'required|string|max:20',
            'secondary_color' => 'required|string|max:20',
            'button_color' => 'required|string|max:20',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'favicon' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,ico|max:2048',
            'footer_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'login_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $this->storeLogoAsset($request->file('logo'), 'logo');
        } else {
            unset($validated['logo']);
        }

        if ($request->hasFile('favicon')) {
            $validated['favicon'] = $this->storeLogoAsset($request->file('favicon'), 'favicon');
        } else {
            unset($validated['favicon']);
        }

        if ($request->hasFile('footer_logo')) {
            $validated['footer_logo'] = $this->storeLogoAsset($request->file('footer_logo'), 'footer_logo');
        } else {
            unset($validated['footer_logo']);
        }

        if ($request->hasFile('login_logo')) {
            $validated['login_logo'] = $this->storeLogoAsset($request->file('login_logo'), 'login_logo');
        } else {
            unset($validated['login_logo']);
        }

        Setting::set($validated);
        Setting::save();

        return json_encode([
            "status" => "success",
            "reload" => true,
            "message" => "Branding settings updated successfully.",
        ]);
    }

    public function emailUpdate(Request $request)
    {
        $validated = $request->validate([
            'mail_driver' => 'required|string|max:50',
            'smtp_host' => 'required|string|max:150',
            'smtp_port' => 'required|integer|min:1|max:65535',
            'smtp_username' => 'required|string|max:120',
            'smtp_password' => 'required|string|max:255',
            'from_email' => 'required|email|max:120',
            'from_name' => 'required|string|max:120',
        ]);

        Setting::set($validated);
        Setting::save();

        return json_encode([
            "status" => "success",
            "reload" => true,
            "message" => "Email settings updated successfully.",
        ]);
    }

    public function otpUpdate(Request $request)
    {
        $validated = $request->validate([
            'otp_expiry_time' => 'required|integer|min:30|max:3600',
            'otp_resend_limit' => 'required|integer|min:1|max:20',
            'otp_retry_attempts' => 'required|integer|min:1|max:20',
        ]);

        Setting::set($validated);
        Setting::save();

        return json_encode([
            "status" => "success",
            "reload" => true,
            "message" => "OTP settings updated successfully.",
        ]);
    }

    public function paymentUpdate(Request $request)
    {
        $validated = $request->validate([
            'razorpay_key_id' => 'nullable|string|max:255',
            'razorpay_key_secret' => 'nullable|string|max:255',
            'stripe_key' => 'nullable|string|max:255',
            'stripe_secret' => 'nullable|string|max:255',
            'payment_mode' => 'required|in:test,live',
            'payment_option_upi' => 'nullable|in:0,1',
            'payment_option_card' => 'nullable|in:0,1',
            'payment_option_net_banking' => 'nullable|in:0,1',
        ]);

        $validated['payment_option_upi'] = $request->boolean('payment_option_upi') ? '1' : '0';
        $validated['payment_option_card'] = $request->boolean('payment_option_card') ? '1' : '0';
        $validated['payment_option_net_banking'] = $request->boolean('payment_option_net_banking') ? '1' : '0';

        Setting::set($validated);
        Setting::save();

        return json_encode([
            "status" => "success",
            "reload" => true,
            "message" => "Payment settings updated successfully.",
        ]);
    }

    private function storeLogoAsset($file, string $prefix): string
    {
        $directory = storage_path('app/public/uploads/logo');
        if (!File::exists($directory)) {
            File::makeDirectory($directory, 0777, true);
        }

        $fileName = $prefix . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $file->move($directory, $fileName);

        return $fileName;
    }


 
}