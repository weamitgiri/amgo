<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CcIngredient extends Model
{
    protected $table = 'cc_ingredients';

    protected $fillable = [
        'name',
        'image_url',
        'is_absurd',
        'activity_id',
        'status',
    ];

    protected $casts = [
        'is_absurd' => 'boolean',
        'activity_id' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
