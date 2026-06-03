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
                            <li class="breadcrumb-item"><a href="{{ url('admin/dashboard') }}">Dashboard</a></li>
                            <li class="breadcrumb-item"><a href="{{ url('admin/users-permissions/users') }}">Users</a></li>
                            <li class="breadcrumb-item active">Update User</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <section class="content animate__animated animate__fadeInLeft">
            <div class="container-fluid">
                <div class="card card-default">
                    <div class="card-header">
                        <h3 class="card-title">Update User</h3>
                    </div>

                    <div class="card-body">
                        <form autocomplete="off" class="ajaxform" method="POST"
                            action="{{ route('admin.users.update', encrypt($users->id)) }}" enctype="multipart/form-data">
                            @csrf
                            @method('PUT')
                            <div class="row">

                                <!-- Username -->
                                <div class="col-sm-6 form-group">
                                    <label>Username<span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('username') is-invalid @enderror"
                                        name="username" autocomplete="off" placeholder="Enter Username"
                                        value="{{ old('username', $users->username) }}" maxlength="255" />
                                    <span class="text-danger">{{ $errors->first('username') }}</span>
                                </div>

                                <!-- Phone -->
                                <div class="col-sm-6 form-group">
                                    <label>Phone Number<span class="text-danger">*</span></label>
                                    <input type="text"
                                        class="form-control digitOnly @error('phone') is-invalid @enderror" name="phone"
                                        autocomplete="off" placeholder="Enter phone number"
                                        value="{{ old('phone', $users->phone) }}" maxlength="16" />
                                    <span class="text-danger">{{ $errors->first('phone') }}</span>
                                </div>

                                <!-- Email Name -->
                                <div class="col-sm-6 form-group">
                                    <label>Email Name<span class="text-danger">*</span></label>
                                    <input type="text" class="form-control @error('email') is-invalid @enderror"
                                        name="email" autocomplete="off" placeholder="Enter email"
                                        value="{{ old('email', $users->email) }}" maxlength="255" />
                                    <span class="text-danger">{{ $errors->first('email') }}</span>
                                </div>

                                <!--new password  -->
                                <div class="col-md-6 form-group">
                                    <label>New Password <span class="text-danger">*</span>
                                    </label>
                                    <div class="input-group">
                                        <input type="password" placeholder="New Password" class="form-control"
                                            name="new_password" value="{{ old('new_password') }}" autocomplete="off" />
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
        <select name="role_id" class="form-control">
            <option value="">Select Role </option>
            @foreach ($roles as $key => $val)
                <option value="{{$val->id}}" @if ($users->role_id == $val->id) {{ 'selected' }} @endif>{{$val->name}}</option>
            @endforeach 
        </select>
        <span class="text-danger">{{ $errors->first('role_id') }}</span>
    </div> --}}

                                <div class="col-md-4 form-group">
                                    <label for="customFile">Profile picture</label>
                                    <div class="custom-file">
                                        <input name="profile_image" type="file" class="custom-file-input "
                                            id="customFile" onchange="readURL(this);"
                                            accept="image/png, image/gif, image/jpeg">
                                        <label class="custom-file-label" for="customFile">Choose file</label>
                                    </div>
                                    @if ($users->profile_photo_path)
                                        <!-- <img src="{{ url('storage/app/public/' . $users->profile_photo_path) }}" class="img-rounded mt-2" height="200px" id="profileImageShow"> -->
                                        <img src="{{ url('admin/showImage/storage/' . $users->profile_photo_path) }}"
                                            class="img-rounded mt-2" height="200px" id="profileImageShow" />
                                    @else
                                        <img width="100px" height="100px" class="img-thumbnail image-width mt-4 mb-3"
                                            id="previewImage" src="{{ asset('admin/images/user.png') }}"
                                            alt="profile image" />
                                    @endif
                                </div>

                            </div>
                            <div class="col-md-12">
                                <button type="submit" class="btn btn-outline-primary">Update</button>
                            </div>
                        </form>
                    </div>

                    <div id="image_preview_before_upload">
                        <center>
                            <img src="" class="img-rounded mt-2" height="200px" id="ImageShow">
                        </center>
                    </div><br>

                </div>

            </div>
    </div>
    </section>
    <!-- /.content -->
    </div>
@endsection

@section('footer_js')
    <script type="text/javascript" nonce="{{ csrf_token() }}">
        $(document).on('click', '#generateRandomString', function() {
            generateRandomString();
        });

        function generateRandomString(length = 12) {
            var password = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?";
            for (var i = 0; i < length; i++) {
                password += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            $("input[name='new_password']").val(password.toUpperCase());
        }

        $(document).on('change', '#file', function() {
            const file = this.files[0];
            if (file) {
                let reader = new FileReader();
                reader.onload = function(event) {
                    $('#ImageShow').attr('src', event.target.result);
                }
                reader.readAsDataURL(file);
            } else {
                $('#ImageShow').attr('src', '');
            }
        });

        $(function() {

            $('form').validate({
                rules: {
                    username: {
                        required: true,
                    },
                    phone: {
                        required: true,
                    }
                },
                messages: {
                    username: {
                        required: "This username field is required.",
                    },
                    phone: {
                        required: "This phone no. field is required.",
                    }
                },
                errorElement: 'span',
                errorPlacement: function(error, element) {
                    error.addClass('invalid-feedback');
                    element.closest('.form-group').append(error);
                },
                highlight: function(element, errorClass, validClass) {
                    $(element).addClass('is-invalid');
                },
                unhighlight: function(element, errorClass, validClass) {
                    $(element).removeClass('is-invalid');
                }
            });
        });
    </script>
@endsection
