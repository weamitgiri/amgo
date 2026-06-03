<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrganizerBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'organizer_id',
        'activity_id',
        'game_id',
        'package_id',
        'scheduled_date',
        'scheduled_time',
        'invitation_link',
        'status',
    ];

    public function organizer()
    {
        return $this->belongsTo(Organizer::class);
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function game()
    {
        return $this->belongsTo(ActivityGame::class, 'game_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function billing()
    {
        return $this->hasOne(OrganizerBilling::class, 'booking_id');
    }
}
