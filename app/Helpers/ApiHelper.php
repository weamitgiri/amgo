<?php

namespace App\Helpers;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class ApiHelper {
    
    public static function userDetails($userid = NULL)
    {
        $userData = User::where('id', $userid)->first();
        return $userData;
    }
}