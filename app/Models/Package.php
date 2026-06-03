<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Package extends Model
{
    use SoftDeletes;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_DRAFT = 'draft';

    protected $fillable = [
        'name',
        'slug',
        'price',
        'max_users',
        'total_groups',
        'validity_days',
        'short_description',
        'features',
        'game_access',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'features' => 'array',
        'game_access' => 'array',
        'deleted_at' => 'datetime',
    ];

    public function purchases()
    {
        return $this->hasMany(PackagePurchase::class);
    }

    public function bookings()
    {
        return $this->hasMany(OrganizerBooking::class);
    }
}
