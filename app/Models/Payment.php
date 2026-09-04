<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A single payment attempt against an organizer booking.
 *
 * Rows are created by the Node API during checkout (that is where the booking
 * flow lives); Laravel reads them for the admin payment module and only ever
 * writes when an admin settles a COD payment by hand.
 */
class Payment extends Model
{
    use HasFactory;

    public const GATEWAY_RAZORPAY = 'razorpay';
    public const GATEWAY_COD = 'cod';

    public const STATUS_PENDING = 'pending';
    public const STATUS_AUTHORIZED = 'authorized';
    public const STATUS_CAPTURED = 'captured';
    public const STATUS_FAILED = 'failed';
    public const STATUS_REFUNDED = 'refunded';
    public const STATUS_CANCELLED = 'cancelled';

    /** Statuses that represent money actually collected. */
    public const SETTLED_STATUSES = [self::STATUS_CAPTURED];

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_AUTHORIZED,
        self::STATUS_CAPTURED,
        self::STATUS_FAILED,
        self::STATUS_REFUNDED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'booking_id',
        'billing_id',
        'organizer_id',
        'payment_method',
        'gateway',
        'gateway_order_id',
        'gateway_payment_id',
        'gateway_signature',
        'amount',
        'currency',
        'payment_status',
        'refund_status',
        'refunded_amount',
        'transaction_reference',
        'failure_reason',
        'paid_at',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * The signature is proof-of-verification kept for dispute forensics, never
     * something to render. Hiding it keeps it out of any accidental toJson().
     */
    protected $hidden = ['gateway_signature'];

    public function booking()
    {
        return $this->belongsTo(OrganizerBooking::class, 'booking_id');
    }

    public function billing()
    {
        return $this->belongsTo(OrganizerBilling::class, 'billing_id');
    }

    public function organizer()
    {
        return $this->belongsTo(Organizer::class, 'organizer_id');
    }

    public function isRazorpay(): bool
    {
        return $this->gateway === self::GATEWAY_RAZORPAY;
    }

    public function isCod(): bool
    {
        return $this->gateway === self::GATEWAY_COD;
    }

    public function scopeSettled($query)
    {
        return $query->whereIn('payment_status', self::SETTLED_STATUSES);
    }

    public function statusBadgeClass(): string
    {
        return match ($this->payment_status) {
            self::STATUS_CAPTURED => 'success',
            self::STATUS_AUTHORIZED => 'info',
            self::STATUS_PENDING => 'warning',
            self::STATUS_FAILED => 'danger',
            self::STATUS_REFUNDED => 'secondary',
            self::STATUS_CANCELLED => 'dark',
            default => 'light',
        };
    }
}
