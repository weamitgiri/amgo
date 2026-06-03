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
              <li class="breadcrumb-item"><a href="{{ url('admin/pages')}}">Page List</a></li>
              <li class="breadcrumb-item active">Edit Page</li>
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
            <h3 class="card-title">Edit Page</h3>
          </div>
          <!-- /.card-header -->
          <div class="card-body">
           
            <form autocomplete="off" method="POST" action="{{ route('admin.pages.update',encrypt($page->id))}}" enctype="multipart/form-data">
            <div class="row">
             @csrf
              @method('PUT')
             <input type="hidden" name="id" value="{{$page->id}}"/>

              <div class="col-md-12 form-group">
                <label>Title</label>
                <input type="text" class="form-control" name="title" autocomplete="off" placeholder="Enter Title" value="{{ old('title',$page->title)}}">
                <span class="text-danger">{{ $errors->first('title') }}</span>
              </div>

              <div class="col-md-12 form-group">
                  <label>Description</label>
                  <textarea maxlength="1000" placeholder="Enter Description" name="description" class="form-control" rows="3" id="ckeditor_full" cols="20" name="description">{{ old('description',$page->description)}}</textarea>
                  <span class="text-danger">{!! $errors->first('description', '<span class="help-block">:message</span>') !!}</span>
              </div>
              
            </div>
            <div class="col-md-12">
              <button type="submit" class="btn btn-primary">Update</button>
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
  
  <script src="https://cdn.ckeditor.com/4.20.0/standard/ckeditor.js"></script>

  <!-- <script src="{{ asset('admin/plugins/ckeditor/ckeditor.js')}}"></script> -->
  <script src="{{ asset('admin/plugins/ckeditor/jquery.js')}}"></script>
  <script src="{{ asset('admin/plugins/ckeditor/config.js')}}"></script>
  <script src="{{ asset('admin/plugins/ckeditor/editor.js')}}"></script>

 <script type="text/javascript" nonce="{{ csrf_token() }}">
   $(function () {
  
  $('form').validate({
    rules: {
      title: {
        required: true,
         noSpace: true,
      },
      description: {
        required: true,
         noSpace: true,
      }
    },
    messages: {
      title: {
        required: "The title field is required.",
      },
      description: {
        required: "Please enter a description",
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
 </script>
  @endsection