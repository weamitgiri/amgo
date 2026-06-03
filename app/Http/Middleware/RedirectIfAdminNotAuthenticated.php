<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RedirectIfAdminNotAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle($request, Closure $next, $guard = 'admin')
    {
        //echo "Asdasddasdasda"; die('new - middleware - check - for - admin');
        /* $str = !Auth::check() ? "Session out" : "Session In";
        echo $str; die(' ==== '); */
        //echo $request->is('admin'); die;
        if (!Auth::guard('admin')->check()) {
            return redirect()->route('admin.login');
        }
        /* if (!auth()->guard($guard)->check()) {
            return redirect()->route('admin.login');
        } */
        return $next($request);
    }
}