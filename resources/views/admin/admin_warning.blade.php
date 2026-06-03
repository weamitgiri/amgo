@extends('admin.layouts.warning')

@section('content')
<div class="container">
  <h3>
    <center>
      <!-- <img class="img-responsive imgLogoMaintain" src="{{asset('front/assets/images/kolkata_customs_logo.png')}}" alt="inner-banner" /> -->
      <input type="hidden" id="errorStatus" value="{{ !empty($status) ? $status : '' }}"/>
      @if(!empty($status) && $status == 429)
        <img style="width:70%;" nonce="{{ csrf_token() }}" class="img-responsive warningPageImg" src="{{asset('admin/images/503-error.png')}}" alt="inner-banner"/>
        <h4> We are redirecting back to you in <span id="secMsg">15 Second</span> remaining.</h4>
      @elseif(!empty($status) && $status == 401)
        <img style="width:70%;" nonce="{{ csrf_token() }}" class="img-responsive warningPageImg" src="{{asset('admin/images/401-error.png')}}" alt="inner-banner"/>
      @elseif(!empty($status) && $status == 503)
        <img class="img-responsive" src="{{asset('front/assets/images/website.png')}}" alt="inner-banner"/>
      @elseif(!empty($status) && $status == 403)
        <img style="width:70%;" nonce="{{ csrf_token() }}" class="img-responsive warningPageImg" src="{{asset('admin/images/error.png')}}" alt="inner-banner"/>
      @else
        <img style="width:70%;" nonce="{{ csrf_token() }}" class="img-responsive warningPageImg" src="{{asset('admin/images/error.png')}}" alt="inner-banner"/>
        <h5 class="mt-3">{{ $message }}</h5>
        <a href="{{ url('/admin/dashboard') }}" class="btn btn-outline-info warBckBtn"> <i class="fa fa-home"></i> Go Home </a>
      @endif

  </center>
</h3>
</div>
@endsection