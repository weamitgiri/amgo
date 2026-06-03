<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Blog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'short_description',
        'content',
        'featured_image',
        'banner_image',
        'category_id',
        'author_id',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'og_image',
        'canonical_url',
        'status',
        'published_at',
        'scheduled_at',
        'is_featured',
        'is_pinned',
        'is_trending',
        'show_on_homepage',
        'allow_comments',
        'show_author',
        'show_related_blogs',
        'reading_time',
        'views_count',
        'comments_count',
        'external_source_url',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'is_featured' => 'boolean',
        'is_pinned' => 'boolean',
        'is_trending' => 'boolean',
        'show_on_homepage' => 'boolean',
        'allow_comments' => 'boolean',
        'show_author' => 'boolean',
        'show_related_blogs' => 'boolean',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = \Str::slug($model->title);
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('title') && empty($model->slug)) {
                $model->slug = \Str::slug($model->title);
            }
        });
    }

    /**
     * Get category relationship
     */
    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'category_id');
    }

    /**
     * Get author relationship
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
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
     * Get tags relationship
     */
    public function tags()
    {
        return $this->belongsToMany(BlogTag::class, 'blog_tag_items', 'blog_id', 'blog_tag_id')
                    ->withTimestamps();
    }

    /**
     * Get media relationship
     */
    public function media()
    {
        return $this->hasMany(BlogMedia::class, 'blog_id')->orderBy('sort_order');
    }

    /**
     * Get comments relationship
     */
    public function comments()
    {
        return $this->hasMany(BlogComment::class, 'blog_id');
    }

    /**
     * Get approved comments relationship
     */
    public function approvedComments()
    {
        return $this->hasMany(BlogComment::class, 'blog_id')->where('approved', true);
    }

    /**
     * Get views relationship
     */
    public function views()
    {
        return $this->hasMany(BlogView::class, 'blog_id');
    }

    /**
     * Scope to published blogs
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                     ->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }

    /**
     * Scope to draft blogs
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope to featured blogs
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to trending blogs
     */
    public function scopeTrending($query)
    {
        return $query->where('is_trending', true);
    }

    /**
     * Publish the blog
     */
    public function publish()
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    /**
     * Draft the blog
     */
    public function draft()
    {
        $this->update(['status' => 'draft']);
    }

    /**
     * Archive the blog
     */
    public function archive()
    {
        $this->update(['status' => 'archived']);
    }

    /**
     * Record a view
     */
    public function recordView($userId = null, $ipAddress = null, $userAgent = null)
    {
        return $this->views()->create([
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }

    /**
     * Increment views count
     */
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'draft' => 'Draft',
            'published' => 'Published',
            'scheduled' => 'Scheduled',
            'archived' => 'Archived',
            default => ucfirst($this->status),
        };
    }

    /**
     * Get featured blogs for homepage
     */
    public static function getHomepageFeatured()
    {
        return static::published()
                     ->where('show_on_homepage', true)
                     ->where('is_featured', true)
                     ->orderBy('published_at', 'desc')
                     ->limit(6)
                     ->get();
    }

    /**
     * Get related blogs
     */
    public function getRelatedBlogs($limit = 5)
    {
        return Blog::published()
                   ->where('id', '!=', $this->id)
                   ->where('category_id', $this->category_id)
                   ->orderBy('published_at', 'desc')
                   ->limit($limit)
                   ->get();
    }
}
