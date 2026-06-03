<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Route;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        //web: __DIR__.'/../routes/web.php',
        //api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        //health: '/up',
        using: function () {
            Route::middleware(['web', 'AllowHostsMiddleware'])->group(base_path('routes/web.php'));
            Route::middleware(['web', 'AllowHostsMiddleware'])->prefix('admin')->group(base_path('routes/admin.php'));
            Route::middleware(['api', 'AllowHostsMiddleware'])->prefix('api')->group(base_path('routes/api.php'));
        }
    )
    ->withMiddleware(function (Middleware $middleware) {
        //throttle 25, 0.2
            $middleware->alias([
                //'AdminRateLimiter' => \App\Http\Middleware\AdminRateLimiter::class,
                //'FrontRateLimiter' => \App\Http\Middleware\FrontRateLimiter::class,
                //'auth' => \App\Http\Middleware\Authenticate::class,
                'AllowHostsMiddleware' => \App\Http\Middleware\AllowHostsMiddleware::class,
                'RedirectIfAdminNotAuthenticated' => \App\Http\Middleware\RedirectIfAdminNotAuthenticated::class,
                'no_cache' => \App\Http\Middleware\NoCacheMiddleware::class,
                'validateGameSession' => \App\Http\Middleware\ValidateGameSession::class,
            ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Throwable $e, $request) {
            if ($request->is('api/*')) {
                $status = 400;
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation error',
                        'errors'  => $e->errors()
                    ], 422);
                }
                
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Resource not found',
                        'errors'  => []
                    ], 404);
                }

                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthenticated',
                        'errors'  => []
                    ], 401);
                }

                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'Something went wrong',
                    'errors'  => config('app.debug') ? ['trace' => $e->getTrace()] : []
                ], method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500);
            }
        });

        $exceptions->render(function (AuthenticationException $exption, Request $request) {
            //echo $exption->getMessage(); die;
            
            //dd($exption->getMessage());

            if($request->is('api/*')) {
                //die('ok');
                 if($exption instanceof AuthenticationException){
                    $response['code']       = 0;
                    $response['error']      = true;
                    $response['message']    = "Unauthenticated";
                    return response()->json($response, Response::HTTP_UNAUTHORIZED);
                }
            }
            else if($request->is('admin/*')){
                $message = "Session expired. Please login again.";
                if ($request->ajax()) {
                    return response()->json(['error'=>true,'message'=>$message],401);
                }
                return response(view('admin.admin_warning',['message'=>$message,'status' => 401]));
            }
            else{
                
                /* echo $request->url();
                echo "<br/>".request()->path(); die; */
                if (request()->path() === 'admin'){
                    return redirect('/admin/login'); // Redirect to admin/login
                }
                
                $message = "Session expired. Please login again.";
                if ($request->ajax()) {
                    return response()->json(['error'=>true,'message'=>$message,'status'=>401],401);
                }
                return response(view('front.front_warning',['message'=>$message,'status' => 401]));
            }
        });

        $exceptions->render(function (HttpException $e, Request $request) {
            $message = "Service Under Maintenance !!!!";

            //dd($e->getMessage());
            //dd($e->getStatusCode());

            //echo "ASDadadasd12312321"; die;
            
            if ($request->is('api/*')) {
                
                return response()->json([
                    'success' => 0,
                    'err_msg' => $e->getMessage(),
                    'result' => null
                ], 400);

            }else if($request->is('admin/*')){
                $message = "Page Not Found.!!!";
                if($e->getStatusCode() == 404){
                    if ($request->ajax()) {
                        return response()->json(['error'=>true,'message'=>$message], $e->getStatusCode());
                    }
                    if(auth('admin')->check()){
                        return response()->view('errors.404', [], 404);
                    }
                    return response(view('admin.admin_warning',['message'=>$message,'status' => $e->getStatusCode()]));
                }

                if ($request->ajax()) {
                    return response()->json(['error'=>true,'message'=>$message], $e->getStatusCode());
                }
                return response(view('admin.admin_warning',['message'=>$message,'status' => $e->getStatusCode()]));
            }else{
                if($e->getStatusCode() == 404){
                    return response()->view('errors.404', [], 404);
                }
                
                if($e->getStatusCode() == 429){
                    //dd($e->getStatusCode());
                    return response(view('front.front_warning',['message'=>$message,'status' => 429]),429);
                }
                
                if($e->getStatusCode() == 405){
                    //dd($e->getStatusCode());
                    return response(view('front.front_warning',['message'=>$message,'status' => 405]),405);
                }

                if ($request->ajax()) {
                    return response()->json(['error'=>true,'message'=>$message,'status'=>503],503);
                }

                if(!empty($e->getStatusCode()) && $e->getStatusCode() == 503){
                    return response(view('front.front_warning',['message'=>$message,'status' => 503]));
                }

                //echo "ASdads"; die;
                
                return response(view('front.front_warning',['message'=>$message,'status' => 419]));
            }
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            $message = "Too many request, Try again after some time !!!!";

            if ($request->is('api/*')) {
                return response()->json([
                    'error' => true,
                    'message' => "Session expired. Please login again.",
                    //'code' => $e->getStatusCode()
                ], 500);
            }else if($request->is('admin/*')){
                //echo $message; die;
                if ($request->ajax()) {
                    return response()->json(['error'=>true,'message'=>$message],429);
                }
                return response(view('admin.admin_warning',['message'=>$message,'status' => 429]));
            }else{
                echo "call from the front side.";die;
                return response()->view('front.front_warning', [
                    'message' => $message,
                    'status' => 429,
                ]);
            }
        }); 

        $exceptions->render(function (RouteNotFoundException $e, Request $request) {
            //echo $request->is('admin'); die(' ==== ');
            
            //dd($e);

            if ($request->is('api/*')) {
                return response()->json([
                    'error' => true,
                    'message' => "Session expired. Please login again.",
                    //'code' => $e->getStatusCode()
                ], 500);
            }else if($request->is('admin/*')){
                $message = "call from the admin side.333";
                if ($request->ajax()) {
                    return response()->json(['error'=>true,'message'=>$message],419);
                }
                return response(view('admin.admin_warning',['message'=>$message,'status' => 419]));
            }else{
                // unauthorized access...!!!
                if(!Auth::check()){
                    return response(view('front.front_warning',['message'=>"Session expired. Please login again.",'status' => 419]));
                }
                //echo "call from the front side.";die;
                return response(view('front.front_warning',['message'=>$e->getMessage(),'status' => 401]));
            }
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            //echo $request->is('admin'); die(' Not Found. ');
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => true,
                    'message' => 'Invalid Route.'
                ], 404);
            }else if($request->is('admin/*')){
                echo "call from the admin side.11"; die;
            }else{
                echo "call from the front side not found http exception.";die;
                //return response(view('front_warning',['message'=>$e->getMessage(),'status' => 429]));
            }
        });

        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            //echo $request->is('admin'); die(' BBBB ');
            if ($request->is('api/*')) {
                return response()->json([
                    'error' => true,
                    'message' => 'Method Not Allow.'
                ], 404);
            }else if($request->is('admin/*')){
                echo "call from the admin side.22";
                die;
            }else{
                echo "call from the front side.";die;
                //return response(view('front_warning',['message'=>$e->getMessage(),'status' => 429]));
            }
        });

    })->create();