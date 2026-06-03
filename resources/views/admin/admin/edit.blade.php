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
                            <li class="breadcrumb-item"><a href="{{ url('/') }}">Dashboard</a></li>
                            <li class="breadcrumb-item"><a href="{{ url('admin/users-permissions/admin') }}">Admin List</a>
                            </li>
                            <li class="breadcrumb-item active">Edit admin</li>
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
                        <h3 class="card-title">Edit Admin</h3>

                    </div>
                    <!-- /.card-header -->
                    <div class="card-body">
                        <form method="POST" action="{{ route('admin.admin.update', encrypt($user->id)) }}">
                            <div class="row">
                                @csrf
                                @method('PUT')
                                <div class="col-md-6 form-group">
                                    <label>Name</label>
                                    <input type="text" class="form-control" name="name"
                                        value="{{ old('name', $user->name) }}" />
                                    <span class="text-danger">{{ $errors->first('name') }}</span>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label>Email</label>
                                    <input type="text" class="form-control" name="email"
                                        value="{{ old('email', $user->email) }}" />
                                    <span class="text-danger">{{ $errors->first('email') }}</span>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label>Password</label>
                                    <input type="password" class="form-control" name="password"
                                        value="{{ old('password') }}" />
                                    <span class="text-danger">{{ $errors->first('password') }}</span>
                                </div>
                                <div class="col-md-6 form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" class="form-control" name="password_confirm"
                                        value="{{ old('password_confirm') }}" />
                                    <span class="text-danger">{{ $errors->first('password_confirm') }}</span>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label>Status</label>
                                    <select name="status" class="form-control">
                                        <option value="1" @if ($user->status == '1') selected="selected" @endif>
                                            Active</option>
                                        <option value="0" @if ($user->status == '0') selected="selected" @endif>
                                            Inactive</option>
                                    </select>
                                    <span class="text-danger">{{ $errors->first('password_confirm') }}</span>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label>Role <span class="text-danger">*</span></label>
                                    <select name="role_id" class="form-control">
                                        <option value="">Select Role </option>
                                        @foreach ($roles as $key => $val)
                                            <option value="{{ $val->id }}"
                                                @if ($user->role_id == $val->id) {{ 'selected' }} @endif>
                                                {{ $val->name }}</option>
                                        @endforeach
                                    </select>
                                    <span class="text-danger">{{ $errors->first('role_id') }}</span>
                                </div>

                            </div>
                            <div class="col-md-12">
                                <button type="submit" class="btn btn-outline-primary">Update</button>
                            </div>
                        </form>
                    </div>

                </div>

            </div>
    </div>
    </section>
    <!-- /.content -->
    </div>
@endsection

@section('footer_js')
    <script type="text/javascript" nonce="{{ csrf_token() }}">
        $(function() {
            $('form').validate({
                rules: {
                    name: {
                        required: true
                    },
                    email: {
                        required: true,
                        email: true,
                    },
                    password: {
                        minlength: 6
                    },
                    password_confirm: {
                        minlength: 6,
                        equalTo: $("input[name='password']")
                    }
                },
                messages: {
                    name: {
                        required: "The Name field is required.",
                    },
                    email: {
                        required: "Please enter a email address",
                        email: "Please enter a valid email address"
                    },
                    password: {
                        minlength: "Your password must be at least 8 characters"
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
