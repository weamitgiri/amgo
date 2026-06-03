<?php

namespace App\Services;

use App\Models\CmsPage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Exception;

class CmsPageService
{
    /**
     * Generate unique slug for CMS page
     */
    public function generateSlug($pageName, $excludeId = null)
    {
        $slug = Str::slug($pageName);
        $originalSlug = $slug;
        $counter = 1;

        while ($this->slugExists($slug, $excludeId)) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Check if slug already exists
     */
    private function slugExists($slug, $excludeId = null)
    {
        $query = CmsPage::where('slug', $slug);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Handle image upload
     */
    public function uploadImage($image)
    {
        try {
            if (!$image) {
                return null;
            }

            $filename = date('YmdHis') . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $path = 'uploads/cms/';

            $image->storeAs('public/' . $path, $filename);

            return $path . $filename;
        } catch (Exception $e) {
            throw new Exception('Error uploading image: ' . $e->getMessage());
        }
    }

    /**
     * Delete image
     */
    public function deleteImage($imagePath)
    {
        try {
            if ($imagePath && Storage::exists('public/' . $imagePath)) {
                Storage::delete('public/' . $imagePath);
            }
        } catch (Exception $e) {
            // Log error but don't throw
            \Log::warning('Error deleting CMS image: ' . $e->getMessage());
        }
    }

    /**
     * Get published pages
     */
    public function getPublishedPages()
    {
        return CmsPage::published()->get();
    }

    /**
     * Get page by slug
     */
    public function getPageBySlug($slug)
    {
        return CmsPage::where('slug', $slug)->published()->first();
    }

    /**
     * Prepare page for frontend
     */
    public function prepareForFrontend(CmsPage $page)
    {
        return [
            'id' => $page->id,
            'page_name' => $page->page_name,
            'slug' => $page->slug,
            'title' => $page->title,
            'content' => $page->content,
            'meta_title' => $page->meta_title,
            'meta_description' => $page->meta_description,
            'meta_keywords' => $page->meta_keywords,
            'featured_image' => $page->featured_image ? asset('storage/' . $page->featured_image) : null,
            'published_at' => $page->published_at,
        ];
    }
}
