<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'game_id',
        'name',
        'email',
        'otp',
        'otp_expires_at',
        'email_verified_at',
        'join_token',
        'status',
    ];

    protected $casts = [
        'otp_expires_at' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(OrganizerBooking::class, 'booking_id');
    }

    public function game()
    {
        return $this->belongsTo(ActivityGame::class, 'game_id');
    }
}
