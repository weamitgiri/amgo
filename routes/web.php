<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    // An already-authenticated admin must go to the dashboard, not the login
    // page. Sending them to /admin/login would bounce them back here (the
    // guest:admin middleware redirects authenticated users to "/"), producing an
    // infinite redirect loop (ERR_TOO_MANY_REDIRECTS).
    if (auth('admin')->check()) {
        return redirect()->route('admin.dashboard.home');
    }

    return redirect()->route('admin.showLoginForm');
});

Route::fallback(function () {
    abort(404);
});
