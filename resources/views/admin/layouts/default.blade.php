<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="3600">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="base-url" content="{{ url('/') }}">
    <meta http-equiv="Strict-Transport-Security" content="Strict-Transport-Security: max-age=31536000; includeSubDomains;">

    @yield('header_metaTag')
    <title>{{ config('app.name', 'Admin Panel') }}</title>
    
    <link rel="icon" type="image/x-icon" href="{{ asset('admin/images/favicon.png')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/fontawesome-free/css/all.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/icheck-bootstrap/icheck-bootstrap.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/jqvmap/jqvmap.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/dist/css/adminlte.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/overlayScrollbars/css/OverlayScrollbars.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/daterangepicker/daterangepicker.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/summernote/summernote-bs4.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/toastr/toastr.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/select2/css/select2.min.css')}}">
    
    <link rel="stylesheet" href="{{ asset('admin/plugins/sweetalert2/sweetalert2.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/datatables-responsive/css/responsive.bootstrap4.min.css')}}">

    <link rel="stylesheet" href="{{ asset('admin/dist/css/custom.css')}}">
    <link rel="stylesheet" href="{{ asset('admin/dist/css/animate.min.css')}}">

  <!-- Custom UI Improvements -->
  <style>
    .nav-sidebar .nav-link.active {
      background-color: #007bff !important;
      color: #fff !important;
      box-shadow: 0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24) !important;
    }
    .card {
      border-radius: 0.75rem;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    .content-header h1 {
      font-size: 1.8rem;
      font-weight: 700;
    }
    .breadcrumb-item a {
      color: #6c757d;
      text-decoration: none;
    }
    .breadcrumb-item.active {
      color: #007bff;
      font-weight: 600;
    }
  </style>
  @yield('header_css')
    
</head>
{{-- <body class="sidebar-mini layout-fixed"> --}}
<body class="sidebar-mini layout-fixed control-sidebar-slide-open">

    <svg xmlns="https://www.w3.org/2000/svg" width="4" height="5" viewBox="0 0 4 5">
        <path fill="#343a40" d="M2 0L0 2h4zm0 5L0 3h4z"/>
    </svg>

    <div class="wrapper">
  <!---- Page refresh loader start----->
    <!-- <div class="preloader flex-column justify-content-center align-items-center" style="background: #706f8a;">
      <img class="" src="{{ asset('admin/images/logo.png')}}">
    </div> -->
  <!---- Page refresh loader end----->

  @include("admin.partials.header")

  @yield('content')

  @include("admin.partials.footer")

  <script src="{{ asset('admin/plugins/jquery/jquery.min.js')}}"></script>
  
  <!-- DataTables -->
  <script src="{{ asset('admin/plugins/datatables/jquery.dataTables.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/datatables-bs4/js/dataTables.bootstrap4.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/datatables-responsive/js/dataTables.responsive.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/datatables-responsive/js/responsive.bootstrap4.min.js')}}"></script>

  <script src="{{ asset('admin/plugins/jquery-ui/jquery-ui.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/bootstrap/js/bootstrap.bundle.min.js')}}"></script>

  <script src="{{ asset('admin/plugins/moment/moment.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/daterangepicker/daterangepicker.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/summernote/summernote-bs4.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/toastr/toastr.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js')}}"></script>
  <script src="{{ asset('admin/dist/js/adminlte.js')}}"></script>
  <script src="{{ asset('admin/plugins/sweetalert2/sweetalert2.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/toastr/toastr.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/select2/js/select2.full.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/jquery-validation/jquery.validate.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/jquery-validation/additional-methods.min.js')}}"></script>
  <script src="{{ asset('admin/plugins/bootstrap-switch/js/bootstrap-switch.min.js')}}"></script>
  <script src="{{ asset('admin/dist/js/forms.js')}}"></script>
  <script src="{{ asset('admin/dist/js/jquery.form.js')}}"></script>
  <script src="{{ asset('admin/dist/js/custom.js')}}"></script>

  <script>
    toastr.options = {
      "closeButton": true,
      "progressBar": true,
      "positionClass": "toast-top-right",
      "timeOut": "3000"
    };
    @if(Session::has('success'))
      toastr.success("{{ Session::get('success') }}");
    @endif
    @if(Session::has('error'))
      toastr.error("{{ Session::get('error') }}");
    @endif
  </script>
  @yield('footer_js')
    
</body>
</html>