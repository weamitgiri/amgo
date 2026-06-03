<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\ContentController;
use App\Http\Controllers\API\ActivityController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\GameJoinController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // Auth APIs with Rate Limiting
    Route::prefix('auth')->middleware('throttle:6,1')->group(function () {
        Route::post('login/send-otp', [AuthController::class, 'sendOtp']);
        Route::post('login/verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('login/resend-otp', [AuthController::class, 'resendOtp']);
    });

    // Game Join APIs (Invitation Flow)
    Route::prefix('game-join')->group(function () {
        Route::get('verify-link/{token}', [GameJoinController::class, 'verifyLink']);
        Route::post('join', [GameJoinController::class, 'joinGame']);
        Route::post('verify-otp', [GameJoinController::class, 'verifyParticipantOtp']);
    });

    // Global Settings
    Route::get('settings', [SettingController::class, 'getGlobalSettings']);

    // Content APIs
    Route::prefix('content')->group(function () {
        Route::get('pages', [ContentController::class, 'getPages']);
        Route::get('pages/{slug}', [ContentController::class, 'getPageBySlug']);
        Route::get('blogs', [ContentController::class, 'getBlogs']);
        Route::get('blogs/{slug}', [ContentController::class, 'getBlogBySlug']);
        Route::get('faqs', [ContentController::class, 'getFaqs']);
    });

    // Activity & Package APIs
    Route::prefix('activities')->group(function () {
        Route::get('games', [ActivityController::class, 'getGames']);
        Route::get('games/{slug}', [ActivityController::class, 'getGameDetails']);
        Route::get('packages', [ActivityController::class, 'getPackages']);
    });

});
