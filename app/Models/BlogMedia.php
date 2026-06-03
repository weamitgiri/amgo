<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlogMedia extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'blog_id',
        'media_path',
        'media_type',
        'alt_text',
        'caption',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Get blog relationship
     */
    public function blog()
    {
        return $this->belongsTo(Blog::class, 'blog_id');
    }
}
