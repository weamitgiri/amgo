<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth('admin')->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $blog = $this->route('blog');
        $blogId = 0;
        if ($blog) {
            $blogId = is_numeric($blog) ? $blog : $blog->id;
        }

        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug,' . $blogId,
            'short_description' => 'required|string|max:500',
            'content' => 'required|string',
            'category_id' => 'required|exists:blog_categories,id',
            'author_id' => 'required|exists:users,id',
            'featured_image' => 'nullable|image|max:5120|mimes:jpeg,png,jpg,webp',
            'banner_image' => 'nullable|image|max:5120|mimes:jpeg,png,jpg,webp',
            'seo_title' => 'nullable|string|max:60',
            'seo_description' => 'nullable|string|max:160',
            'seo_keywords' => 'nullable|string|max:255',
            'og_image' => 'nullable|image|max:5120|mimes:jpeg,png,jpg,webp',
            'status' => 'required|in:draft,published,scheduled,archived',
            'published_at' => 'nullable|date',
            'scheduled_at' => 'nullable|date|after_or_equal:today',
            'is_featured' => 'boolean',
            'is_pinned' => 'boolean',
            'is_trending' => 'boolean',
            'show_on_homepage' => 'boolean',
            'allow_comments' => 'boolean',
            'show_author' => 'boolean',
            'show_related_blogs' => 'boolean',
            'reading_time' => 'nullable|integer|min:1',
            'external_source_url' => 'nullable|url',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Blog title is required',
            'content.required' => 'Blog content is required',
            'category_id.required' => 'Please select a category',
            'author_id.required' => 'Please select an author',
            'featured_image.max' => 'Featured image must not exceed 5MB',
            'banner_image.max' => 'Banner image must not exceed 5MB',
            'seo_title.max' => 'SEO title must not exceed 60 characters',
            'seo_description.max' => 'SEO description must not exceed 160 characters',
        ];
    }
}
