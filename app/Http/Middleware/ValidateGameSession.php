<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\UsersToken;

class ValidateGameSession
{
    public function handle($request, Closure $next)
    {
        //$userToken = $request->user_token;
        $sessionToken = $request->session_token;
        $userId = $request->user_id;

        $gameSession = UsersToken::where('userid', $userId)
            //->where('session_expiry', '>', now())
            ->first();

        if (!$gameSession) {
            return response()->json(['code' => 401 , 'message' => 'User id is invalid'], 401);
            //return response()->json(['code' => 401 , 'message' => 'User token is invalid'], 401);
            //return response()->json(['code' => 403 , 'message' => 'User token is expired'], 403);
        }

        if (!$gameSession && $gameSession->session_token !== $sessionToken) {
            return response()->json(['code' => 401 , 'message' => 'Session token is invalid'], 401);
            //return response()->json(['code' => 403 , 'message' => 'User token is expired'], 403);
        }

        /* if ($gameSession && $gameSession->session_token !== $sessionToken) {
            return response()->json(['code' => 401 , 'message' => 'Session token is invalid'], 401);
            //return response()->json(['code' => 403 , 'message' => 'User token is expired'], 403);
        } */

        return $next($request);
    }
}
