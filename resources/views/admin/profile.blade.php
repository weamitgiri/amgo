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
              <li class="breadcrumb-item">Profile</li>
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
            <h3 class="card-title">Edit Profile </h3>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-12 text-center">
                @if($user->profile_photo_path)
                <!-- <img src="{{ url($user->profile_photo_path)}}" class="rounded-circle" id="image_preview" height="100px" width="100px"> -->
                <img src="{{ url('admin/showImage/storage/'.$user->profile_photo_path)}}" class="rounded-circle" id="image_preview" height="100px" width="100px" />
                @else
                <img src="https://ui-avatars.com/api/?name={{ $user->name}}&color=7F9CF5&background=EBF4FF" id="image_preview" class="rounded-circle" height="100px" width="100px"/>
                @endif
              </div>
            </div>
            <hr>
            <form autocomplete="off" method="POST" action="{{ route('admin.home.profileUpdate')}}" id="update_profile" enctype="multipart/form-data">
             @csrf
            <div class="row">
              <div class="col-md-6 form-group">
                <label> Name</label>
                <input type="text" class="form-control" name="name" value="{{ old('name',$user->name)}}" maxlength="70">
                <span class="text-danger">{{ $errors->first('name') }}</span>
              </div>
               
              <div class="col-md-6 form-group">
                <label>Email</label>
                <input type="email" class="form-control" name="email" value="{{ old('email',$user->email)}}">
                <span class="text-danger">{{ $errors->first('email') }}</span>
              </div>
              
              <div class="col-md-6 form-group">
                <label>Profile Photo</label>
                <input type="file" class="form-control" name="image" id="image" accept="image/*">
                <span class="text-danger">{{ $errors->first('image') }}</span>
              </div>
              
            </div>
            <div class="col-md-12">
              <button type="submit" class="btn btn-outline-primary">Save Profile</button>
            </div>
             </form>
          </div>
        </div>

        <div class="card card-default">
        <div class="card-header">
          <h3 class="card-title">Change Password</h3>
          <div class="card-tools">
         
          </div>
          </div>
          <div class="card-body">
            <form autocomplete="off" method="POST" action="{{ route('admin.home.updatePassword')}}" id="change_password">
             @csrf
            <div class="row">
              <div class="col-md-6 form-group">
                <label> Current Password</label>
                <input type="password" class="form-control" name="current_password"/>
                <span class="text-danger">{{ $errors->first('current_password') }}</span>
              </div>
               
              <div class="col-md-6 form-group">
                <label>New Password</label>
                <input type="password" class="form-control" name="new_password"/>
                <span class="text-danger">{{ $errors->first('new_password') }}</span>
              </div>
              
              <div class="col-md-6 form-group">
                <label>Confirm Password</label>
                <input type="password" class="form-control" name="confirm_password"/>
                <span class="text-danger">{{ $errors->first('confirm_password') }}</span>
              </div>
              
            </div>
            <div class="col-md-12">
              <button type="submit" class="btn btn-outline-primary">Save Password</button>
            </div>
             </form>
          </div>
        </div>
        </div>
      </div>
    </section>
  </div>
 @endsection

 @section('footer_js')
 <script type="text/javascript" nonce="{{ csrf_token() }}">

  $(function () {
  
  $('#update_profile').validate({
    rules: {
      name: {
        required: true,
         noSpace: true,
      },
      email: {
        required: true,
        email: true,
         noSpace: true,
      },
      offical_email: {
        required: true,
        email: true,
        noSpace: true,
      },
      address: {
        required: true,
        noSpace: true,
      }
    },
    messages: {
      name: {
        required: "The name field is required",
      },
      email: {
        required: "The email field is required",
        email: "Please enter a valid email address",
      },
      offical_email: {
        required: "The offical email field is required",
        email: "Please enter a valid offical email address",
      },
      address: {
        required: "The Address field is required",
      }
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

  $('#change_password').validate({
    rules: {
      current_password: {
        required: true
      },
      new_password: {
        required: true,
        minlength: 8,
        regex: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
      },
      confirm_password: {
        required: true,
        minlength: 8,
        equalTo: $("input[name='new_password']")
      },
    },
    messages: {
      current_password: {
        required: "The current password field is required",
      },
      new_password: {
        required: "The new password field is required",
        regex : "Password must be at least 8 characters and must contain at least one lower case letter, one upper case letter and one digit"
      },
      confirm_password: {
        required: "The confirm password field is required",
        equalTo : "The new password and confirm password should be same"
      }
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

  image.onchange = evt => {
  const [file] = image.files
  if (file) {
    image_preview.src = URL.createObjectURL(file)
  }
}
  </script>
@endsection