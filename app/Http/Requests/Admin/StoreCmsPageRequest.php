<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCmsPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // On update the page being edited must not collide with its own name/slug.
        $ignoreId = $this->editingPageId();

        return [
            'page_name' => ['required', 'string', 'max:255', Rule::unique('cms_pages', 'page_name')->ignore($ignoreId)],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('cms_pages', 'slug')->ignore($ignoreId)],
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

    /**
     * Id of the page being updated, or null when creating. The resource route's
     * {page} parameter carries the encrypted id (the edit form posts to
     * route('admin.cms.update', encrypt($page->id))), so decrypt it here.
     */
    private function editingPageId(): ?int
    {
        $param = $this->route('page');
        if ($param === null) {
            return null;
        }

        try {
            return (int) decrypt($param);
        } catch (DecryptException $e) {
            return is_numeric($param) ? (int) $param : null;
        }
    }
}
