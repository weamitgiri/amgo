<?php

namespace App\Http\Controllers\API;

use App\Models\Organizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AuthController extends BaseController
{
    /**
     * Send OTP for Login
     */
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:organizers,email',
        ], [
            'email.exists' => 'This email is not registered with us.',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation error', $validator->errors(), 422);
        }

        try {
            $organizer = Organizer::where('email', $request->email)->first();
            
            // Generate 6-digit OTP
            $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            
            $organizer->update([
                'otp' => $otp,
                'otp_expires_at' => Carbon::now()->addMinutes(10),
            ]);

            // In a real application, you would send an email here with the OTP.
            // Mail::to($organizer->email)->send(new LoginOtpMail($otp));

            return $this->successResponse([
                'email' => $organizer->email,
                'otp_debug' => config('app.debug') ? $otp : null,
            ], 'An OTP has been sent to your registered email.');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to send OTP', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Verify OTP and Login
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:organizers,email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation error', $validator->errors(), 422);
        }

        try {
            $organizer = Organizer::where('email', $request->email)->first();

            if ($organizer->otp !== $request->otp || Carbon::now()->gt($organizer->otp_expires_at)) {
                return $this->errorResponse('Invalid or expired OTP', [], 400);
            }

            // Clear OTP after successful verification
            $organizer->update([
                'otp' => null,
                'otp_expires_at' => null,
                'is_email_verified' => true, // Ensure it's marked as verified
                'status' => 'active', // Activate if it was inactive
            ]);

            // For now, we return the organizer details. 
            // In a full implementation with Sanctum, we would return $organizer->createToken('auth_token')->plainTextToken;
            
            return $this->successResponse([
                'organizer' => $organizer,
                'access_token' => 'dummy-token-' . Str::random(40), // Placeholder until Sanctum is set up
                'token_type' => 'Bearer',
            ], 'Login successful.');
            
        } catch (\Exception $e) {
            return $this->errorResponse('Verification failed', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:organizers,email',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation error', $validator->errors(), 422);
        }

        try {
            $organizer = Organizer::where('email', $request->email)->first();
            
            $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            
            $organizer->update([
                'otp' => $otp,
                'otp_expires_at' => Carbon::now()->addMinutes(10),
            ]);

            return $this->successResponse([
                'email' => $organizer->email,
                'otp_debug' => config('app.debug') ? $otp : null,
            ], 'OTP has been resent to your email.');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to resend OTP', ['error' => $e->getMessage()]);
        }
    }
}
