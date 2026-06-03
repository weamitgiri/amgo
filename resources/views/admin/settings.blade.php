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
              <li class="breadcrumb-item active">Settings</li>
          </ol>
      </div>
  </div>
</div>
</div>

<section class="content animate__animated animate__fadeInLeft">
  <div class="container-fluid">       
     <div class="card card-default">
        <div class="card-header">
          <h3 class="card-title">Settings</h3>
      </div>

      <div class="card-body">
          <form method="POST" autocomplete="off" action="{{ route('admin.settings.updateSettings')}}" enctype="multipart/form-data">
            @csrf
            @method('PUT')
            <div class="row">

        <div class="col-md-12">

            <div class="row" style="align-items: center;">
              
              <div class="col-md-6 form-group">
                <label class="lblname">Logo Image</label>
                <input type="file" class="form-control" name="logo" id="logo" accept="image/*">
                <h6 class="text-primary"> Dimensions : width = 596px, height = 127px </h6>
                <span class="text-danger">{{ $errors->first('logo') }}</span>
              </div>

              <div class="col-md-6 form-group">
                <label class="lblname">&nbsp;</label>
                <img style="max-width:100%;" src="{{url('storage/app/public/uploads/header/'.setting('logo'))}}" class="mb-2"/>
              </div>

              <div class="col-md-12 form-group">
                <label class="lblname">Address</label>
                <input type="text" class="form-control" name="address" id="address" placeholder="Address" maxlength="150" />
                <span class="text-danger">{{ $errors->first('address') }}</span>
              </div>

              <div class="col-md-6 form-group">
                <label class="lblname">Contact No</label>
                <input type="text" class="form-control" name="contact" id="contact" placeholder="Contact No." />
                <span class="text-danger">{{ $errors->first('contact') }}</span>
              </div>

              <div class="col-md-6 form-group">
                <label class="lblname">Control Room</label>
                <input type="text" class="form-control" name="control_room" id="control_room" placeholder="Control Room" />
                <span class="text-danger">{{ $errors->first('control_room') }}</span>
              </div>

              <div class="col-md-6 form-group">
                <label class="lblname">Foreign Parcel Enquiry</label>
                <input type="text" class="form-control" name="foreign_enquiry" id="foreign_enquiry" placeholder="Foreign Parcel Enquiry" />
                <span class="text-danger">{{ $errors->first('foreign_enquiry') }}</span>
              </div>

            </div>

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