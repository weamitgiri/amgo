<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogTagRequest extends FormRequest
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
        $tagId = $this->route('blog_tag') ? (is_numeric($this->route('blog_tag')) ? $this->route('blog_tag') : 0) : 0;

        return [
            'name' => 'required|string|max:255|unique:blog_tags,name,' . $tagId,
            'slug' => 'nullable|string|max:255|unique:blog_tags,slug,' . $tagId,
            'status' => 'required|in:0,1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Tag name is required',
            'name.unique' => 'This tag already exists',
            'status.required' => 'Please select a status',
        ];
    }
}
