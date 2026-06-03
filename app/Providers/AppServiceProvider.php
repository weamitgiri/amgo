<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Validator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //Validation
        /* Validator::extend('regxEgHi', function($attribute, $value, $parameters){
            $pattern = '/^[a-zA-Z0-9?!@#$%^&:*()\'\"\/\_\-\,\.\\\x{0900}-\x{097F}\s]+$/u';
            return preg_match($pattern, $value) ? true : false ;
        });

        Validator::replacer('regxEgHi', function ($message, $attribute, $rule, $parameters) {
            return str_replace(':attribute', $attribute, ':attribute can only contain english, hindi letters numbers special symbols.');
        }); */

        //admin rate limit
        /* RateLimiter::for('admin', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        }); */

        //front rate limit
        /* RateLimiter::for('front_web', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        }); */

    }
}
