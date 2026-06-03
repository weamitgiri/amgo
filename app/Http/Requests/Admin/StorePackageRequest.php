<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $packageId = $this->route('package');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('packages', 'slug')->ignore($packageId),
            ],
            'price' => ['required', 'numeric', 'min:0'],
            'max_users' => ['required', 'integer', 'min:1'],
            'total_groups' => ['required', 'integer', 'min:1'],
            'validity_days' => ['required', 'integer', 'min:1'],
            'short_description' => ['nullable', 'string'],
            'features' => ['nullable', 'array'],
            'features.*' => ['nullable', 'string', 'max:255'],
            'game_access' => ['nullable', 'array'],
            'game_access.*' => ['nullable', 'string', 'max:100'],
            'status' => ['required', Rule::in(['active', 'inactive', 'draft'])],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
