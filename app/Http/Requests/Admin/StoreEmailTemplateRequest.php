<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmailTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:email_templates,name,' . ($this->email_template->id ?? 'NULL'),
            'slug' => 'nullable|string|max:255|unique:email_templates,slug,' . ($this->email_template->id ?? 'NULL'),
            'subject' => 'required|string|max:500',
            'body' => 'required|string',
            'description' => 'nullable|string|max:500',
            'variables' => 'nullable|string',
            'status' => 'required|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The email template name is required.',
            'name.unique' => 'This email template name already exists.',
            'subject.required' => 'The email subject is required.',
            'body.required' => 'The email body is required.',
        ];
    }
}
