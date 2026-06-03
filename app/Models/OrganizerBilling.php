<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrganizerBilling extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'gst_number',
        'billing_address',
        'city',
        'state',
        'pin_code',
        'package_price',
        'taxes',
        'additional_charges',
        'gst_amount',
        'total_payable',
        'payment_method',
        'payment_status',
        'confirmation_details',
    ];

    protected $casts = [
        'confirmation_details' => 'array',
    ];

    public function booking()
    {
        return $this->belongsTo(OrganizerBooking::class, 'booking_id');
    }
}
