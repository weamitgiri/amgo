<?php

namespace App\Services;

use App\Models\Blog;
use App\Models\BlogMedia;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;

class BlogService
{
    /**
     * Create a blog post
     */
    public function createBlog(array $data)
    {
        $data['created_by'] = auth()->id();
        $data['updated_by'] = auth()->id();

        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['title']);
        }

        // Calculate reading time if not provided
        if (empty($data['reading_time'])) {
            $data['reading_time'] = $this->calculateReadingTime($data['content']);
        }

        $blog = Blog::create($data);

        // Attach tags if provided
        if (!empty($data['tags'])) {
            $blog->tags()->attach($data['tags']);
        }

        return $blog;
    }

    /**
     * Update a blog post
     */
    public function updateBlog(Blog $blog, array $data)
    {
        $data['updated_by'] = auth()->id();

        if (!empty($data['title']) && $blog->isDirty('title')) {
            if (empty($data['slug'])) {
                $data['slug'] = $this->generateUniqueSlug($data['title'], $blog->id);
            }
        }

        // Calculate reading time if content changed
        if (!empty($data['content']) && $blog->isDirty('content')) {
            $data['reading_time'] = $this->calculateReadingTime($data['content']);
        }

        $blog->update($data);

        // Sync tags if provided
        if (isset($data['tags'])) {
            $blog->tags()->sync($data['tags']);
        }

        return $blog;
    }

    /**
     * Delete a blog post
     */
    public function deleteBlog(Blog $blog)
    {
        // Delete associated media files
        foreach ($blog->media as $media) {
            $this->deleteMediaFile($media->media_path);
        }

        return $blog->delete();
    }

    /**
     * Force delete a blog post
     */
    public function forceDeleteBlog(Blog $blog)
    {
        // Delete associated media files
        foreach ($blog->media as $media) {
            $this->deleteMediaFile($media->media_path);
        }

        // Delete featured and banner images
        if ($blog->featured_image) {
            $this->deleteMediaFile($blog->featured_image);
        }
        if ($blog->banner_image) {
            $this->deleteMediaFile($blog->banner_image);
        }
        if ($blog->og_image) {
            $this->deleteMediaFile($blog->og_image);
        }

        return $blog->forceDelete();
    }

    /**
     * Upload featured image
     */
    public function uploadFeaturedImage(UploadedFile $file, Blog $blog = null)
    {
        $path = $file->store('blogs/featured', 'public');

        // Delete old image if updating
        if ($blog && $blog->featured_image) {
            $this->deleteMediaFile($blog->featured_image);
        }

        return $path;
    }

    /**
     * Upload banner image
     */
    public function uploadBannerImage(UploadedFile $file, Blog $blog = null)
    {
        $path = $file->store('blogs/banners', 'public');

        // Delete old image if updating
        if ($blog && $blog->banner_image) {
            $this->deleteMediaFile($blog->banner_image);
        }

        return $path;
    }

    /**
     * Upload OG image
     */
    public function uploadOgImage(UploadedFile $file, Blog $blog = null)
    {
        $path = $file->store('blogs/og', 'public');

        // Delete old image if updating
        if ($blog && $blog->og_image) {
            $this->deleteMediaFile($blog->og_image);
        }

        return $path;
    }

    /**
     * Upload media to gallery
     */
    public function uploadMedia(Blog $blog, UploadedFile $file, string $type = 'image', string $altText = null, string $caption = null)
    {
        $path = $file->store('blogs/media', 'public');

        return $blog->media()->create([
            'media_path' => $path,
            'media_type' => $type,
            'alt_text' => $altText,
            'caption' => $caption,
            'sort_order' => $blog->media->count(),
        ]);
    }

    /**
     * Delete media file
     */
    public function deleteMediaFile($path)
    {
        if ($path && \Storage::disk('public')->exists($path)) {
            return \Storage::disk('public')->delete($path);
        }
        return false;
    }

    /**
     * Generate unique slug
     */
    public function generateUniqueSlug(string $title, int $excludeId = null)
    {
        $slug = Str::slug($title);
        $count = 1;
        $originalSlug = $slug;

        while (Blog::where('slug', $slug)->where('id', '!=', $excludeId)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }

    /**
     * Calculate reading time
     */
    public function calculateReadingTime(string $content, int $wordsPerMinute = 200)
    {
        $wordCount = str_word_count(strip_tags($content));
        return max(1, ceil($wordCount / $wordsPerMinute));
    }

    /**
     * Publish blog
     */
    public function publishBlog(Blog $blog)
    {
        $blog->publish();
        return $blog;
    }

    /**
     * Archive blog
     */
    public function archiveBlog(Blog $blog)
    {
        $blog->archive();
        return $blog;
    }

    /**
     * Clone blog
     */
    public function cloneBlog(Blog $blog)
    {
        $newBlog = $blog->replicate();
        $newBlog->title = $blog->title . ' (Copy)';
        $newBlog->slug = $this->generateUniqueSlug($newBlog->title);
        $newBlog->status = 'draft';
        $newBlog->published_at = null;
        $newBlog->views_count = 0;
        $newBlog->save();

        // Clone tags
        $newBlog->tags()->attach($blog->tags->pluck('id')->toArray());

        return $newBlog;
    }

    /**
     * Get featured blogs
     */
    public function getFeaturedBlogs($limit = 6)
    {
        return Blog::published()
                   ->featured()
                   ->orderBy('published_at', 'desc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Get blogs by category
     */
    public function getBlogsByCategory($categoryId, $limit = null)
    {
        $query = Blog::published()
                     ->where('category_id', $categoryId)
                     ->orderBy('published_at', 'desc');

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Get trending blogs
     */
    public function getTrendingBlogs($limit = 5)
    {
        return Blog::published()
                   ->trending()
                   ->orderBy('views_count', 'desc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Search blogs
     */
    public function searchBlogs(string $query)
    {
        return Blog::published()
                   ->where('title', 'like', "%{$query}%")
                   ->orWhere('short_description', 'like', "%{$query}%")
                   ->orderBy('published_at', 'desc')
                   ->get();
    }
}
