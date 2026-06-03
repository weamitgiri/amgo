<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogView extends Model
{
    public $timestamps = true;

    protected $fillable = [
        'blog_id',
        'user_id',
        'ip_address',
        'user_agent',
    ];

    /**
     * Get blog relationship
     */
    public function blog()
    {
        return $this->belongsTo(Blog::class, 'blog_id');
    }

    /**
     * Get user relationship
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
