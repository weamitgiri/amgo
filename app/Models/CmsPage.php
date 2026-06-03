<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class CmsPage extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'cms_pages';

    protected $fillable = [
        'page_name',
        'slug',
        'title',
        'content',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'featured_image',
        'status',
        'published_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-generate slug from page_name if not provided
        static::creating(function ($model) {
            if (!$model->slug) {
                $model->slug = Str::slug($model->page_name);
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('page_name') && !$model->isDirty('slug')) {
                $model->slug = Str::slug($model->page_name);
            }
        });
    }

    /**
     * Get the creator of the CMS page.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    /**
     * Get the updater of the CMS page.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by', 'id');
    }

    /**
     * Scope to get only published pages.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 1)->where('published_at', '<=', now());
    }

    /**
     * Scope to get only draft pages.
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 0);
    }

    /**
     * Get status label.
     */
    public function getStatusLabelAttribute()
    {
        return $this->status == 1 ? 'Published' : 'Draft';
    }

    /**
     * Publish the page.
     */
    public function publish()
    {
        $this->update([
            'status' => 1,
            'published_at' => now(),
        ]);
    }

    /**
     * Move to draft.
     */
    public function draft()
    {
        $this->update([
            'status' => 0,
        ]);
    }
}
