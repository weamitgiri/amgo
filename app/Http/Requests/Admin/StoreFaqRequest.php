<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreFaqRequest extends FormRequest
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
        return [
            'question' => 'required|string|max:500',
            'answer' => 'required|string',
            'category_id' => 'required|exists:faq_categories,id',
            'sort_order' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'status' => 'required|in:0,1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'question.required' => 'FAQ question is required',
            'answer.required' => 'FAQ answer is required',
            'category_id.required' => 'Please select a category',
            'status.required' => 'Please select a status',
        ];
    }
}
