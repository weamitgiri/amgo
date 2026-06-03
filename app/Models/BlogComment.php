<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlogComment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'blog_id',
        'user_id',
        'content',
        'approved',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'approved' => 'boolean',
        'approved_at' => 'datetime',
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

    /**
     * Get approved by user relationship
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Approve comment
     */
    public function approve($userId = null)
    {
        $this->update([
            'approved' => true,
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }

    /**
     * Reject comment
     */
    public function reject()
    {
        $this->update(['approved' => false]);
    }
}
