<?php

namespace App\Http\Controllers\API;

use App\Models\OrganizerBooking;
use App\Models\GameParticipant;
use App\Models\ActivityGame;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GameJoinController extends BaseController
{
    /**
     * Verify the invitation link and return game info
     */
    public function verifyLink($linkToken)
    {
        try {
            $booking = OrganizerBooking::with(['activity.games', 'organizer'])
                ->where('invitation_link', $linkToken)
                ->first();

            if (!$booking) {
                return $this->errorResponse('Invalid or expired invitation link', [], 404);
            }

            if ($booking->status === 'expired') {
                return $this->errorResponse('This game session has expired', [], 400);
            }

            return $this->successResponse([
                'activity_title' => $booking->activity->title,
                'organizer_name' => $booking->organizer->name,
                'scheduled_at' => $booking->scheduled_date . ' ' . $booking->scheduled_time,
                'games' => $booking->activity->games->map(function($game) {
                    return [
                        'id' => $game->id,
                        'title' => $game->title,
                    ];
                })
            ], 'Link verified successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to verify link', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Join game - Step 1: Enter Name and Email, Send OTP
     */
    public function joinGame(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'link_token' => 'required|exists:organizer_bookings,invitation_link',
            'game_id' => 'required|exists:activity_games,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation error', $validator->errors(), 422);
        }

        try {
            $booking = OrganizerBooking::with('package')->where('invitation_link', $request->link_token)->first();
            
            // 1. Check Package User Limits
            $maxUsers = $booking->package->max_users ?? 0;
            if ($maxUsers > 0) {
                $currentParticipantsCount = GameParticipant::where('booking_id', $booking->id)
                    ->whereNotNull('email_verified_at')
                    ->count();

                // If user is already verified, allow them to re-join/re-send OTP
                $isAlreadyJoined = GameParticipant::where('booking_id', $booking->id)
                    ->where('email', $request->email)
                    ->whereNotNull('email_verified_at')
                    ->exists();

                if (!$isAlreadyJoined && $currentParticipantsCount >= $maxUsers) {
                    return $this->errorResponse('Join limit reached for this session. This package allows a maximum of ' . $maxUsers . ' participants.', [], 403);
                }
            }
            
            // Check if game belongs to the activity
            $game = ActivityGame::where('id', $request->game_id)
                ->where('activity_id', $booking->activity_id)
                ->first();

            if (!$game) {
                return $this->errorResponse('Invalid game selected for this activity', [], 400);
            }

            // Generate 6-digit OTP
            $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Create or update participant
            $participant = GameParticipant::updateOrCreate(
                [
                    'booking_id' => $booking->id,
                    'email' => $request->email,
                ],
                [
                    'game_id' => $game->id,
                    'name' => $request->name,
                    'otp' => $otp,
                    'otp_expires_at' => Carbon::now()->addMinutes(10),
                    'join_token' => Str::random(40),
                    'status' => 'joined',
                ]
            );

            // In a real application, send email with OTP
            // Mail::to($participant->email)->send(new GameJoinOtpMail($otp));

            return $this->successResponse([
                'email' => $participant->email,
                'otp_debug' => config('app.debug') ? $otp : null,
            ], 'An OTP has been sent to your email for verification.');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to initiate join process', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Join game - Step 2: Verify OTP and Redirect to Game
     */
    public function verifyParticipantOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'link_token' => 'required|exists:organizer_bookings,invitation_link',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation error', $validator->errors(), 422);
        }

        try {
            $booking = OrganizerBooking::where('invitation_link', $request->link_token)->first();
            
            $participant = GameParticipant::where('email', $request->email)
                ->where('booking_id', $booking->id)
                ->first();

            if (!$participant || $participant->otp !== $request->otp || Carbon::now()->gt($participant->otp_expires_at)) {
                return $this->errorResponse('Invalid or expired OTP', [], 400);
            }

            // Mark email as verified
            $participant->update([
                'otp' => null,
                'otp_expires_at' => null,
                'email_verified_at' => Carbon::now(),
                'status' => 'playing',
            ]);

            return $this->successResponse([
                'participant' => [
                    'name' => $participant->name,
                    'email' => $participant->email,
                    'join_token' => $participant->join_token,
                ],
                'redirect_url' => '/game/' . $participant->game_id . '?token=' . $participant->join_token,
            ], 'OTP verified successfully. Redirecting to game...');

        } catch (\Exception $e) {
            return $this->errorResponse('Verification failed', ['error' => $e->getMessage()]);
        }
    }
}
