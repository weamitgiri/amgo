<?php

namespace App\Http\Middleware;
use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Support\Facades\Auth;

class Authenticate extends Middleware
{
    protected function redirectTo($request)
    {
        //echo '<pre>'; print_r($request->all()); die;
        if (! $request->expectsJson()) {
            //echo '<pre>'; print_r($request->all()); die;
            if($request->is('admin') || $request->is('admin/*')){
                //echo ":ASDads"; die;
                if(Auth::guard('admin')->check()){
                    return url('admin/dashboard');
                }
                //echo "111ASdasd"; die;
                return url('admin/login');
            }else{
                if(Auth::check()){
                    //echo "ASDads"; die;
                    return url('/user-profile');
                }
                return url('/user-profile');
            }
            //die('=a-sd=-asd=-ad=');
            return url('/');
        }
    }
}