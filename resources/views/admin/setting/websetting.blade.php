@extends('admin.layouts.default')
 
@section('content') 
  
  <div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0"></h1>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="{{ url('admin/dashboard')}}">Dashboard</a></li>
              <!-- <li class="breadcrumb-item"><a href="{{ url('admin/settings')}}">Settings</a></li> -->
              <li class="breadcrumb-item active">Settings Update</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <section class="content">
      <div class="container-fluid">
       
       <div class="card card-default">
          <div class="card-header">
            <h3 class="card-title">Settings </h3>
          </div>
          <!-- /.card-header -->
          <div class="card-body"> 





















<div class="row">
    
   <div class="col-12 col-sm-12">
      <div class="card card-primary card-outline card-outline-tabs">
         <div class="card-header p-0 border-bottom-0">
            <ul class="nav nav-tabs" id="custom-tabs-four-tab" role="tablist">
               <li class="nav-item"><a class="nav-link active" data-toggle="pill" href="#tab-general" role="tab">General</a></li>
               <li class="nav-item"><a class="nav-link" data-toggle="pill" href="#tab-branding" role="tab">Branding</a></li>
               <li class="nav-item"><a class="nav-link" data-toggle="pill" href="#tab-seo" role="tab">SEO</a></li>
               <li class="nav-item"><a class="nav-link" data-toggle="pill" href="#tab-email" role="tab">Email</a></li>
               <li class="nav-item"><a class="nav-link" data-toggle="pill" href="#tab-otp" role="tab">OTP</a></li>
               <li class="nav-item"><a class="nav-link" data-toggle="pill" href="#tab-payment" role="tab">Payment</a></li>
               <li class="nav-item"><a class="nav-link" data-toggle="pill" href="#tab-social" role="tab">Social Media</a></li>
            </ul>
         </div>
         <div class="card-body">
            <div class="tab-content" id="custom-tabs-four-tabContent">
               <div class="tab-pane fade active show" id="tab-general" role="tabpanel">@include('admin.setting.site')</div>
               <div class="tab-pane fade" id="tab-branding" role="tabpanel">@include('admin.setting.branding')</div>
               <div class="tab-pane fade" id="tab-seo" role="tabpanel">@include('admin.setting.seo')</div>
               <div class="tab-pane fade" id="tab-email" role="tabpanel">@include('admin.setting.email')</div>
               <div class="tab-pane fade" id="tab-otp" role="tabpanel">@include('admin.setting.otp')</div>
               <div class="tab-pane fade" id="tab-payment" role="tabpanel">@include('admin.setting.payment')</div>
               <div class="tab-pane fade" id="tab-social" role="tabpanel">@include('admin.setting.social-links')</div>
            </div>
         </div>
      </div>
   </div>
</div>













          </div>
          <!-- /.card-body -->
          
        </div>
        <!-- /.card -->

        </div>
      </div><!-- /.container-fluid -->
    </section>
    <!-- /.content -->
  </div>
 @endsection
 