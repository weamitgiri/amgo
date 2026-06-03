<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- <meta http-equiv="refresh" content="3600"> -->

    <meta http-equiv="Strict-Transport-Security"
        content="Strict-Transport-Security: max-age=31536000; includeSubDomains;">

    <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self' *.google.com 'nonce-{{ csrf_token() }}'; style-src 'self' *.google.com https://fonts.googleapis.com cdnjs.cloudflare.com  'unsafe-inline'; font-src 'self' https://fonts.gstatic.com cdnjs.cloudflare.com data:;">
  <meta http-equiv="Content-Security-Policy" content="script-src 'self' *.google.com 'unsafe-inline' 'unsafe-eval' 'nonce-{{ csrf_token() }}';">

  <meta http-equiv="Content-Security-Policy" content="img-src 'self' data:;"> -->

    <title>{{ config('app.name', 'GT') }}</title>

    <link rel="icon" type="image/x-icon" href="{{ asset('admin/images/favicon.png') }}">
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />

    <link rel="stylesheet" href="{{ asset('admin/dist/css/adminlte.min.css') }}">
    <link rel="stylesheet" href="{{ asset('admin/dist/css/custom.css') }}">

</head>

<body class="hold-transition sidebar-mini login-body">

    <div class="wrapper">
        <div class="container">
            <div class="row mt-2 mb-5 block_center">
                <div class="col-md-5">
                    <br>
                    <center><img class="imgLogin mb-2" src="{{ asset('admin/images/logo.png') }}"></center>
                    <br>
                    <div class="card card-info">
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

                        <form class="form-horizontal" method="POST" action="{{ route('admin.login') }}"
                            autocomplete="off">
                            @csrf
                            <div class="card-body">
                                <div class="form-group">
                                    <!-- <input type="hidden" name="enckey" id="enckey" value="<?php //echo $randomString;
                                    ?>"> -->
                                    <label for="inputEmail3" class="col-form-label">Email <span
                                            class="text-danger">*</span></label>
                                    <input type="text" class="form-control" name="email" id="inputEmail3"
                                        placeholder="Email" value="{{ old('email') }}" />
                                    <span class="text-danger text-white">{{ $errors->first('email') }}</span>
                                </div>
                                <div class="form-group">
                                    <label for="inputPassword3" class="col-form-label">Password <span
                                            class="text-danger">*</span></label>
                                    <div class="input-group">
                                        <input type="password" id="inputPassword3" name="password" class="form-control"
                                            placeholder="Password" />
                                        <div class="input-group-append">
                                            <span class="input-group-text show-password">
                                                <i class="fas fa-eye"></i>
                                            </span>
                                        </div>
                                    </div>
                                    <span class="text-danger text-danger">{{ $errors->first('password') }}</span>
                                </div>

                                {{-- <div class="form-group">
                  <label for="inputCaptch" class="col-form-label"></label>
                  <div class="input-group"> 
                      <div class="captcha">
                          <span>{!! captcha_img() !!}</span>
                          <button type="button" id="reload" class="Captcha_btn reload"><i class="fa fa-refresh" aria-hidden="true"></i></button>
                      </div>
                  </div>
              </div>

              <div class="form-group mt-3">
                  <label>Enter Captcha Code:</label>
                  <input id="captcha" type="text" class="form-control" placeholder="Enter Captcha" name="captcha" value="" />
                  <span class="text-danger text-white">{{ $errors->first('captcha') }}</span>
              </div> --}}

                                <div class="form-group text-center container">
                                    <button type="submit"
                                        class="btn text-white mb-2 btn-block loginBtnAdmin">Login</button>
                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="{{ asset('admin/plugins/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('admin/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('admin/plugins/jquery-validation/jquery.validate.min.js') }}"></script>
    <script src="{{ asset('admin/plugins/jquery-validation/additional-methods.min.js') }}"></script>
    <script src="{{ asset('admin/dist/js/login.js') }}"></script>

    <script type="text/javascript">
        // captcha for new query
        $(document).ready(function() {
            $('#reload').click(function() {
                $.ajax({
                    type: 'GET',
                    url: '{{ url('/') }}' + '/admin/reload-captcha',
                    success: function(data) {
                        console.log(data.captcha);
                        $(".captcha span").html(data.captcha);
                    }
                });
            });
        });
    </script>
</body>

</html>