<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BlogTag extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'blog_tags';

    protected $fillable = [
        'name',
        'slug',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = \Str::slug($model->name);
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('name') && empty($model->slug)) {
                $model->slug = \Str::slug($model->name);
            }
        });
    }

    /**
     * Get creator relationship
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get updater relationship
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get blogs with this tag
     */
    public function blogs()
    {
        return $this->belongsToMany(Blog::class, 'blog_tag_items', 'blog_tag_id', 'blog_id')
                    ->withTimestamps();
    }

    /**
     * Scope to active tags
     */
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return $this->status ? 'Active' : 'Inactive';
    }
}
