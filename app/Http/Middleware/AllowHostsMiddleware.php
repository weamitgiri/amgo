<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AllowHostsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // From config (not env()) so it keeps working after `php artisan config:cache`.
        $allowedHosts = config('app.trusted_hosts', []);
        //echo $request->getHttpHost()." >> ".$request->getSchemeAndHttpHost()." >>> ".$request->getHost(); die;
        $host = $request->getHost();
        //die('---');
        if (!in_array($host, $allowedHosts)) {
            $message = "Unauthorized Access !!!!";
            if(request()->is('admin/*')){
                if ($request->ajax()) {
                    return response()->json(['error'=>true,'message'=>$message,'status'=>401],401);
                }
                return response(view('admin.admin_warning',['message'=>$message,'status' => 401]));
            }
            if ($request->ajax()) {
                return response()->json(['error'=>true,'message'=>$message,'status'=>401],401);
            }
            return response(view('front.front_warning',['message'=>$message,'status' => 401]));
        }
        return $next($request);
    }
}