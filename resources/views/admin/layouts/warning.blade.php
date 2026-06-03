<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- <meta http-equiv="refresh" content="3600"> -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="base-url" content="{{ url('/') }}">

    <meta http-equiv="Strict-Transport-Security" content="Strict-Transport-Security: max-age=31536000; includeSubDomains;">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'nonce-{{ csrf_token() }}'; style-src 'self' https://fonts.googleapis.com cdnjs.cloudflare.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com cdnjs.cloudflare.com;">

    @yield('header_metaTag')
    <title>{{ config('app.name', 'GT') }}</title>
    
    <link rel="icon" type="image/x-icon" href="{{ asset('admin/images/favicon.png')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/fontawesome-free/css/all.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/dist/css/adminlte.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/dist/css/custom.css')}}">

    @yield('header_css')
    
</head>
<body class="sidebar-mini layout-fixed">
    <div class="wrapper">

      @yield('content')

        <script src="{{ asset('admin/plugins/jquery/jquery.min.js')}}"></script>
        <script src="{{ asset('admin/plugins/jquery-ui/jquery-ui.min.js')}}"></script>
        <script src="{{ asset('admin/dist/js/adminlte.js')}}"></script>
        <script src="{{ asset('admin/plugins/toastr/toastr.min.js')}}"></script>
        <script src="{{ asset('admin/plugins/jquery-validation/jquery.validate.min.js')}}"></script>
        <script src="{{ asset('admin/dist/js/custom.js')}}"></script>

      @yield('footer_js')

</body>
</html>