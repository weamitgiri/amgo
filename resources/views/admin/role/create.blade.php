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
              <li class="breadcrumb-item"><a href="{{ url('admin/users-permissions/role')}}">Role Manager</a></li>
              <li class="breadcrumb-item active">Create a Role</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <section class="content">
      <div class="container-fluid">
       
       <div class="card card_body_scroll">
          <div class="card-header">
            <!-- <h3 class="card-title">Create a Role</h3> -->
            <div class="card-tools">
          <a href="{{ url('admin/users-permissions/role')}}" style="float: right;" class="btn btn-primary btn-sm"><i class="fa fa-arrow-left" aria-hidden="true"></i>
          Back</a>
          </div>
          </div>
           
  
          <!-- /.card-header -->
          <div class="card-body">
            <form autocomplete="off" method="POST" action="{{ route('admin.role.store')}}" id="user_create">
            <div class="row">
             @csrf
            
              <div class="col-md-6 form-group">
                <label>Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" name="name" value="{{ old('name')}}" autocomplete="off">
                <span class="text-danger">{{ $errors->first('name') }}</span>
              </div>
            
              
            </div>
            <div class="col-md-12">
              <button type="submit" class="btn btn-primary"><i class="fa fa-floppy-o" aria-hidden="true"></i> Submit</button>
              <button type="reset" class="btn btn-danger"><i class="fa fa-refresh" aria-hidden="true"></i> Reset</button>
            </div>
             </form>
          </div>
          <!-- /.card-body -->
          
        </div>
        <!-- /.card -->

        </div>
      </div>
    </section>
  </div>
 @endsection

@section('footer_js')


 <script type="text/javascript" nonce="{{ csrf_token() }}">
   $(function () {
  
  $('form').validate({
    rules: {
      name: {
        required: true
      }, 
    },
    messages: {
      name: {
        required: "The Name field is required.",
      },  
      
    },
    submitHandler: function (form) {
      form.submit();
      $("button[type='submit']").html('<i class="fa fa-spinner fa-spin"></i> Submiting...');
      $("button[type='submit']").prop('disabled', true);
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