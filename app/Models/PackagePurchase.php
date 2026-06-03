<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackagePurchase extends Model
{
    protected $fillable = [
        'package_id',
        'user_id',
        'amount',
        'status',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
