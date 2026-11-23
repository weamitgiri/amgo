<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Throwable;

class CacheController extends Controller
{
    /**
     * Clear the application caches from the admin header. Flushes the application
     * cache plus the config, route and view caches, so freshly uploaded content
     * (e.g. activity cover images) and settings are served without a redeploy.
     * Only clears caches — never touches any data.
     */
    public function clear(Request $request)
    {
        try {
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');
        } catch (Throwable $e) {
            Log::error('Admin cache clear failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Could not clear the cache. Please try again.');
        }

        return redirect()->back()->with('success', 'Cache cleared successfully.');
    }
}
