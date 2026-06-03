<?php

namespace App\Http\Requests\Admin;

class UpdateActivityGameRequest extends StoreActivityGameRequest
{
    public function rules(): array
    {
        // Same rules for create/update; update route model binding already ensures the game exists.
        // Keep strict rules so the wizard always saves a complete, consistent game definition.
        return parent::rules();
    }
}

