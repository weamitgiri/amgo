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
                            <li class="breadcrumb-item active">Create a new admin</li>
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
                        <h3 class="card-title">Create a New Admin</h3>
                    </div>
                    <!-- /.card-header -->
                    <div class="card-body">
                        <form method="POST" action="{{ route('admin.admin.store') }}" id="user_create" autocomplete="off">
                            <div class="row">
                                @csrf
                                <div class="col-md-6 form-group">
                                    <label>Name</label>
                                    <input type="text" class="form-control" name="name" value="{{ old('name') }}"
                                        autocomplete="off">
                                    <span class="text-danger">{{ $errors->first('name') }}</span>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label>Email</label>
                                    <input type="text" class="form-control" name="email" value="{{ old('email') }}"
                                        autocomplete="off">
                                    <span class="text-danger">{{ $errors->first('email') }}</span>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label>Password</label>
                                    <input type="password" class="form-control" name="password" autocomplete="off"
                                        value="{{ old('password') }}" />
                                    <span class="text-danger">{{ $errors->first('password') }}</span>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label>Confirmation Password</label>
                                    <input type="password" class="form-control" name="password_confirm" autocomplete="off"
                                        value="{{ old('password_confirm') }}" />
                                    <span class="text-danger">{{ $errors->first('password_confirm') }}</span>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label>Status</label>
                                    <select name="status" class="form-control">
                                        <option value="1">Acive</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                    <span class="text-danger">{{ $errors->first('status') }}</span>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label>Role <span class="text-danger">*</span></label>
                                    <select name="role_id" id="role_id"
                                        class="form-control @error('role_id') is-invalid @enderror">
                                        <option value="">Select Role </option>
                                        @foreach ($roles as $key => $val)
                                            <option value="{{ $val->id }}" {{ old('role_id') }}>{{ $val->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <span class="text-danger">{!! $errors->first('role_id', '<span class="help-block">:message</span>') !!}</span>
                                </div>

                            </div>

                            <div class="col-md-12">
                                <button type="submit" class="btn btn-outline-primary">Register</button>
                            </div>
                        </form>
                        <!-- /.row -->
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
                        required: true,
                        minlength: 6
                    },
                    password_confirm: {
                        required: true,
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
                        required: "Please provide a password",
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