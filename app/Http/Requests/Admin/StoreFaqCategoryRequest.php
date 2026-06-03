<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreFaqCategoryRequest extends FormRequest
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
        $categoryId = $this->route('faq_category') ? (is_numeric($this->route('faq_category')) ? $this->route('faq_category') : 0) : 0;

        return [
            'name' => 'required|string|max:255|unique:faq_categories,name,' . $categoryId,
            'slug' => 'nullable|string|max:255|unique:faq_categories,slug,' . $categoryId,
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
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
