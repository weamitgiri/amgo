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
              <li class="breadcrumb-item"><a href="{{ url('/')}}">Dashboard</a></li>
              <li class="breadcrumb-item"><a href="{{ url('sub-admin')}}">Sub Admin</a></li>
              <li class="breadcrumb-item active">Edit Sub-admin</li>
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
            <h3 class="card-title">Edit Sub Admin</h3>
            
          </div>
          <!-- /.card-header -->
          <div class="card-body">
            <form method="POST" action="{{ route('admin.sub-admin.update',encrypt($user->id))}}">
            <div class="row">
             @csrf
             @method('PUT')
              <div class="col-md-6 form-group">
                <label>Name</label>
                <input type="text" class="form-control" name="name" value="{{ old('name',$user->name)}}">
                <span class="text-danger">{{ $errors->first('name') }}</span>
              </div>
               
              <div class="col-md-6 form-group">
                <label>Email</label>
                <input type="text" class="form-control" name="email" value="{{ old('email',$user->email)}}">
                <span class="text-danger">{{ $errors->first('email') }}</span>
              </div>
                
              <div class="col-md-6 form-group">
                <label>Password</label>
                <input type="password" class="form-control" name="password">
                <span class="text-danger">{{ $errors->first('password') }}</span>
              </div>
              <div class="col-md-6 form-group">
                <label>Confirm Password</label>
                <input type="password" class="form-control" name="password_confirm">
                <span class="text-danger">{{ $errors->first('password_confirm') }}</span>
              </div>  
            </div>
            <div class="col-md-12">
              <button type="submit" class="btn btn-primary">Update</button>
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