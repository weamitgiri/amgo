<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="Strict-Transport-Security"
        content="Strict-Transport-Security: max-age=31536000; includeSubDomains;">
    <title>{{ config('app.name', 'GT') }}</title>

    <link rel="icon" type="image/x-icon" href="{{ asset('admin/images/favicon.png') }}">
    <link rel="stylesheet" href="{{ asset('admin/dist/css/adminlte.min.css')}}">
    <link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.2.0/css/all.css'>
    <link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.2.0/css/fontawesome.css'>
    <link rel="stylesheet" href="{{ asset('admin/dist/css/login-page-style.css') }}">

</head>

<body>
    <div class="container">
        <center><img class="imgLogin mb-2 mt-3" src="{{ asset('admin/images/logo.png')}}"></center>
       <div class="center_items">
        
        <div class="screen">
            <div class="screen__content">

                @if (session()->has('error'))
                    <div class="alert alert-danger">
                        <button type="button" class="close" data-dismiss="alert">&times;</button>
                        {{ session()->get('error') }}
                    </div>
                @elseif(session()->has('success'))
                    <div class="alert alert-success">
                        <button type="button" class="close" data-dismiss="alert">&times;</button>
                        {{ session()->get('success') }}
                    </div>
                @endif

                <form class="form-horizontal login" method="POST" action="{{ route('admin.login') }}" autocomplete="off">
                    @csrf
                    <div class="login__field">
                        <i class="login__icon fas fa-user"></i>
                        <input type="text" class="login__input form-control" name="email" id="inputEmail3" placeholder="Email" value="{{ old('email') }}" />
                        <span class="text-danger">{{ $errors->first('email') }}</span>
                    </div>
                    <div class="login__field">
                        <i class="login__icon fas fa-lock"></i>
                        <input type="password" id="inputPassword3" name="password" class="login__input form-control" placeholder="Password" />
                        <span class="text-danger">{{ $errors->first('password') }}</span>
                    </div>
                    <button type="submit" class="button login__submit">
                        <span class="button__text">Log In </span>
                        <i class="button__icon fas fa-chevron-right"></i>
                    </button>
                </form>
            </div>
            <div class="screen__background">
                <span class="screen__background__shape screen__background__shape4"></span>
                <span class="screen__background__shape screen__background__shape3"></span>
                <span class="screen__background__shape screen__background__shape2"></span>
                <span class="screen__background__shape screen__background__shape1"></span>
            </div>
        </div>
       </div>
    </div>

    <script src="{{ asset('admin/plugins/jquery/jquery.min.js')}}"></script>
    <script src="{{ asset('admin/plugins/bootstrap/js/bootstrap.bundle.min.js')}}"></script>
    <script src="{{ asset('admin/plugins/jquery-validation/jquery.validate.min.js')}}"></script>
    <script src="{{ asset('admin/plugins/jquery-validation/additional-methods.min.js')}}"></script>
    <script src="{{ asset('admin/dist/js/login.js')}}"></script>

</body>
</html>