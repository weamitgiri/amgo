<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CcRatingCategory extends Model
{
    protected $table = 'cc_rating_categories';

    protected $fillable = [
        'name',
        'slug',
        'emoji',
        'description',
        'status',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = \Str::slug($model->name);
            }
        });
    }
}
