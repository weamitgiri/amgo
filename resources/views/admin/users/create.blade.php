@extends('admin.layouts.default')

@section('content') 

<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0"></h1>
        </div>
        <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="{{ url('admin/dashboard')}}">Dashboard</a></li>
              <li class="breadcrumb-item"><a href="{{ url('admin/users-permissions/users')}}">Users</a></li>
              <li class="breadcrumb-item active">Add Users</li>
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
        <h3 class="card-title">Add Users</h3>
    </div>

    <div class="card-body">
        <form autocomplete="off" method="POST" class="ajaxform" action="{{ route('admin.users.store')}}" enctype="multipart/form-data">
          @csrf
          <div class="row"> 

            <!-- First Name -->
           {{--  <div class="col-sm-6 form-group">
              <label>First Name<span class="text-danger">*</span></label>
              <input type="text" class="form-control @error('first_name') is-invalid @enderror" name="first_name" autocomplete="off" placeholder="Enter first name" autocomplete="off" value="{{ old('first_name')}}" maxlength="255">
              <span class="text-danger">{{ $errors->first('first_name') }}</span>
          </div>

          <!-- Last Name -->
          <div class="col-sm-6 form-group">
              <label>Last Name<span class="text-danger">*</span></label>
              <input type="text" class="form-control @error('last_name') is-invalid @enderror" name="last_name" autocomplete="off" placeholder="Enter last name" autocomplete="off" value="{{ old('last_name')}}" maxlength="255">
              <span class="text-danger">{{ $errors->first('last_name') }}</span>
          </div> --}}

            <!-- username -->
          <div class="col-sm-6 form-group">
            <label>Username<span class="text-danger">*</span></label>
            <input type="text" class="form-control @error('username') is-invalid @enderror" name="username" autocomplete="off" placeholder="Enter Username" autocomplete="off" value="{{ old('username')}}" maxlength="255">
            <span class="text-danger">{{ $errors->first('username') }}</span>
        </div>

          <!-- Phone -->
          <div class="col-sm-6 form-group">
              <label>Phone Number<span class="text-danger">*</span></label>
              <input type="text" class="form-control digitOnly @error('phone') is-invalid @enderror" name="phone" autocomplete="off" placeholder="Enter phone number" autocomplete="off" value="{{ old('phone')}}" maxlength="16">
              <span class="text-danger">{{ $errors->first('phone') }}</span>
          </div>

          <!-- Email Name -->
          <div class="col-sm-6 form-group">
              <label>Email Name </label>
              <input type="text" class="form-control @error('email') is-invalid @enderror" name="email" autocomplete="off" placeholder="Enter email" autocomplete="off" value="{{ old('email')}}" maxlength="255">
              <span class="text-danger">{{ $errors->first('email') }}</span>
          </div>

          <!--new password  -->
          <div class="col-md-6 form-group">
            <label>New Password <span class="text-danger">*</span>
            </label>
            <div class="input-group"> 
                <input type="password" class="form-control" placeholder="New Password" name="new_password" value="{{ old('new_password')}}" autocomplete="off">
                <div class="input-group-append">
                    <span class="input-group-text show-password">
                        <i class="fas fa-eye"></i>
                    </span>
                    <!-- <button class="btn btn-success" id="generateRandomString" type="button">Genrate Code</button> -->
                </div>
            </div>
            <span class="text-danger">{{ $errors->first('new_password') }}</span>
        </div>

        {{-- <div class="col-md-6 form-group">
            <label>Role <span class="text-danger">*</span></label>
            <select name="role_id" id="role_id" class="form-control @error('role_id') is-invalid @enderror">
                <option value="">Select Role </option>
                @foreach($roles as $key=>$val)
                <option value="{{ $val->id }}" {{ old('role_id') }}>{{ $val->name }}</option>
                @endforeach 
            </select>
            <span class="text-danger">{!! $errors->first('role_id', '<span class="help-block">:message</span>') !!}</span>
        </div> --}}

        <div class="col-md-6 form-group">
          <label for="customFile">Profile picture</label>
          <div class="custom-file">
              <input name="profile_image" type="file" class="custom-file-input " id="customFile" onchange="readURL(this);" accept="image/png, image/gif, image/jpeg">
              <label class="custom-file-label" for="customFile">Choose file</label>
              <span class="text-danger">{{ $errors->first('profile_image') }}</span>
          </div>
          <img width="150px" height="150px" class="img-thumbnail image-width mt-4 mb-3" id="previewImage" src="{{ asset('admin/images/user.png')}}" alt="profile image">
      </div>

  </div>

  <div class="col-md-12">
      <button type="submit" class="btn btn-outline-primary">Save</button>
  </div>
</form>
</div>

<div id="image_preview_before_upload">
    <center>
      <img src="" class="img-rounded mt-2" height="200px" id="ImageShow">
  </center>
</div>

<br>

</div>

</div>
</div>
</section>
</div>
@endsection

@section('footer_js')
<script type="text/javascript" nonce="{{ csrf_token() }}">

$(document).ready(function(){
    $('#generateRandomString').on('click',function(){
        generateRandomString();
    });
});

function generateRandomString(length=12) {
    var password = "";
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?';
    for (var i = 0; i < length; i++){
        password += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    $("input[name='new_password']").val(password);
}

/*@if(empty(old('new_password')))
    generateRandomString();
@endif*/

$("select[name='role_id']").select2({placeholder:'Please select role',allowClear: true});

$(function () {

    $('form').validate({
        rules: {
            username: {
                required: true,
            },
            phone: {
                required: true,
            },
            new_password: {
                required: true,
            }
        },
        messages: {
            username: {
                required: "This username field is required.",
            },
            phone: {
                required: "This phone no field is required.",
            },
            new_password: {
                required: "This new password field is required.",
            },
        },
        errorElement: 'span',
        errorPlacement: function (error, element) {
            error.addClass('invalid-feedback');
            element.closest('.form-group').append(error);
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('is-invalid');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass('is-invalid');
        }
        });
    });
</script>
@endsection