<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organizer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'company_name',
        'company_website',
        'designation',
        'phone',
        'otp',
        'otp_expires_at',
        'email_verified_at',
        'status',
    ];

    protected $casts = [
        'otp_expires_at' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    public function bookings()
    {
        return $this->hasMany(OrganizerBooking::class);
    }
}
