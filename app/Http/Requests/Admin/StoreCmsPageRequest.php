<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCmsPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page_name' => 'required|string|max:255|unique:cms_pages,page_name,' . ($this->cms_page->id ?? 'NULL'),
            'slug' => 'nullable|string|max:255|unique:cms_pages,slug,' . ($this->cms_page->id ?? 'NULL'),
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:500',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'status' => 'required|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'page_name.required' => 'The page name is required.',
            'page_name.unique' => 'This page name already exists.',
            'title.required' => 'The page title is required.',
            'content.required' => 'The page content is required.',
            'featured_image.image' => 'The featured image must be a valid image file.',
            'featured_image.max' => 'The featured image must not exceed 5MB.',
        ];
    }
}
