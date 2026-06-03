<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->usertype <= 1;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $categoryId = $this->route('blog_category') ? (is_numeric($this->route('blog_category')) ? $this->route('blog_category') : 0) : 0;

        return [
            'name' => 'required|string|max:255|unique:blog_categories,name,' . $categoryId,
            'slug' => 'nullable|string|max:255|unique:blog_categories,slug,' . $categoryId,
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:50',
            'status' => 'required|in:0,1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Category name is required',
            'name.unique' => 'This category name already exists',
            'status.required' => 'Please select a status',
        ];
    }
}
