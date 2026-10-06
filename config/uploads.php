<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Web server request limit (MB)
    |--------------------------------------------------------------------------
    |
    | The largest request body the web server in front of PHP accepts — nginx's
    | client_max_body_size. PHP cannot read that value, so if it is lower than
    | PHP's post_max_size, set UPLOAD_MAX_REQUEST_MB to match it: the admin
    | panel then shows a "too large" toast before sending, instead of nginx's
    | "413 Request Entity Too Large" page. 0 = use post_max_size only.
    |
    */

    'max_request_mb' => (int) env('UPLOAD_MAX_REQUEST_MB', 0),

];
