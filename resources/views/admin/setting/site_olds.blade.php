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
              <li class="breadcrumb-item"><a href="{{ url('admin/settings')}}">Settings</a></li>
              <li class="breadcrumb-item active">Update Setting</li>
          </ol>
      </div>
  </div>
</div>
</div>

<!-- Main content -->
<section class="content animate__animated animate__fadeInLeft">
  <div class="container-fluid">

   <div class="card card-default">
        <div class="card-header">
            <h3 class="card-title">Update Site Settings</h3>
        </div>

    <!-- /.card-header -->
    <div class="card-body">
        <form method="POST" action="{{ route('admin.settings.updateSettings')}}" enctype="multipart/form-data">
           @csrf
            <div class="row">
             <!--Site Name  -->
             <div class="col-md-4 form-group">
                <label>Site Name</label>
                <input name="site_name" id="site_name" type="text"
                class="form-control @error('site_name') is-invalid @enderror"
                value="{{ old('site_name', setting('site_name')) }}">
               <span class="text-danger">{{ $errors->first('site_name') }}</span>
            </div>
 

             <!--Contact No  -->
             <div class="col-md-4 form-group">
                <label>Contact No</label>
                <input name="contact_no" maxlength="10" id="contact_no" type="text"
                class="form-control @error('contact_no') is-invalid @enderror"
                value="{{ old('contact_no', setting('contact_no')) }}">
               <span class="text-danger">{{ $errors->first('contact_no') }}</span>
            </div>
 

             <!--control_room -->
             <div class="col-md-4 form-group">
                <label>Control Room</label>
                <input name="control_room" maxlength="10" id="control_room" type="text"
                class="form-control @error('control_room') is-invalid @enderror"
                value="{{ old('control_room', setting('control_room')) }}">
               <span class="text-danger">{{ $errors->first('control_room') }}</span>
            </div>
 

              <!--control_room -->
             <div class="col-md-4 form-group">
                <label>Foreign Parcel Enquiry</label>
                <input name="foreign_enquiry" maxlength="10" id="foreign_enquiry" type="text"
                class="form-control @error('foreign_enquiry') is-invalid @enderror"
                value="{{ old('foreign_enquiry', setting('foreign_enquiry')) }}">
               <span class="text-danger">{{ $errors->first('foreign_enquiry') }}</span>
            </div>
 


            

             <!--Site Name  -->
             <div class="col-md-4 form-group">
                <label>Site Footer</label>
                <input name="site_footer" id="site_footer" type="text"
                class="form-control @error('site_footer') is-invalid @enderror"
                value="{{ old('site_footer', setting('site_footer')) }}">
               <span class="text-danger">{{ $errors->first('site_footer') }}</span>
            </div>
 

             <!--Site Address  -->
             <div class="col-md-6 form-group">
                <label>Site address</label>
                <textarea class="form-control @error('site_address') is-invalid @enderror" name="site_address">{{ old('site_address', setting('site_address')) }}</textarea>
               <span class="text-danger">{{ $errors->first('site_address') }}</span>
            </div>

             <!--Site Address  -->
             <div class="col-md-6 form-group">
                <label>Site Description</label>
                <textarea class="form-control @error('site_description') is-invalid @enderror" name="site_description">{{ old('site_description', setting('site_description')) }}</textarea>
               <span class="text-danger">{{ $errors->first('site_description') }}</span>
            </div>
            
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
        </div>
 


<div class="row">
     <div class="card-header col-sm-12">
                <div class="clearfix">
                  <h2 class="card-title float-left">Social Settings</h2>
            </div>
        </div>


                 
 

             <!--Facebook Link  -->
             <div class="col-md-4 form-group">
                <label>Facebook Link</label>
                <input name="facebook_link" id="facebook_link" type="text"
                class="form-control @error('facebook_link') is-invalid @enderror"
                value="{{ old('facebook_link', setting('facebook_link')) }}">
               <span class="text-danger">{{ $errors->first('facebook_link') }}</span>
            </div>


             <!--Instagram Link  -->
             <div class="col-md-4 form-group">
                <label>Instagram Link</label>
                <input name="instagram_link" id="instagram_link" type="text"
                class="form-control @error('instagram_link') is-invalid @enderror"
                value="{{ old('instagram_link', setting('instagram_link')) }}">
               <span class="text-danger">{{ $errors->first('instagram_link') }}</span>
            </div>


             <!--Twitter Link  -->
             <div class="col-md-4 form-group">
                <label>Twitter Link</label>
                <input name="twitter_link" id="twitter_link" type="text"
                class="form-control @error('twitter_link') is-invalid @enderror"
                value="{{ old('twitter_link', setting('twitter_link')) }}">
               <span class="text-danger">{{ $errors->first('twitter_link') }}</span>
            </div>

            <!--Linkedin Link  -->
            <div class="col-md-4 form-group">
                <label>Linkedin Link</label>
                <input name="linkedin_link" id="linkedin_link" type="text"
                class="form-control @error('linkedin_link') is-invalid @enderror"
                value="{{ old('linkedin_link', setting('linkedin_link')) }}">
               <span class="text-danger">{{ $errors->first('linkedin_link') }}</span>
            </div>



            <!--vimeo Link  -->
            <div class="col-md-4 form-group">
                <label>Vimeo Link</label>
                <input name="vimeo_link" id="vimeo_link" type="text"
                class="form-control @error('vimeo_link') is-invalid @enderror"
                value="{{ old('vimeo_link', setting('vimeo_link')) }}">
               <span class="text-danger">{{ $errors->first('vimeo_link') }}</span>
            </div>


               <!--yelp Link  -->
            <div class="col-md-4 form-group">
                <label>Yelp Link</label>
                <input name="yelp_link" id="yelp_link" type="text"
                class="form-control @error('yelp_link') is-invalid @enderror"
                value="{{ old('yelp_link', setting('yelp_link')) }}">
               <span class="text-danger">{{ $errors->first('yelp_link') }}</span>
            </div>


               <!--youtube Link  -->
            <div class="col-md-4 form-group">
                <label>Youtube Link</label>
                <input name="youtube_link" id="youtube_link" type="text"
                class="form-control @error('youtube_link') is-invalid @enderror"
                value="{{ old('youtube_link', setting('youtube_link')) }}">
               <span class="text-danger">{{ $errors->first('youtube_link') }}</span>
            </div>

               <!--rss Link  -->
            <div class="col-md-4 form-group">
                <label>RSS Link</label>
                <input name="rss_link" id="rss_link" type="text"
                class="form-control @error('rss_link') is-invalid @enderror"
                value="{{ old('rss_link', setting('rss_link')) }}">
               <span class="text-danger">{{ $errors->first('rss_link') }}</span>
            </div>
</div>


   <div class="row">
     <div class="card-header col-sm-12">
                <div class="clearfix">
                  <h2 class="card-title float-left">Kolkata Custom Settings</h2>
            </div>
        </div>

            <!--Number Of Awards  -->
             <div class="col-md-4 form-group">
                <label>Number Of Awards</label>
                <input name="number_of_awards" id="number_of_awards" type="text"
                class="form-control @error('number_of_awards') is-invalid @enderror"
                value="{{ old('number_of_awards', setting('number_of_awards')) }}">
               <span class="text-danger">{{ $errors->first('number_of_awards') }}</span>
            </div>

              <!--Ranked  -->
             <div class="col-md-4 form-group">
                <label>Ranked</label>
                <input name="ranked" id="ranked" type="text"
                class="form-control @error('ranked') is-invalid @enderror"
                value="{{ old('ranked', setting('ranked')) }}">
               <span class="text-danger">{{ $errors->first('ranked') }}</span>
            </div>

              <!--Successful Campeigns  -->
             <div class="col-md-4 form-group">
                <label>Successful Campeigns</label>
                <input name="successful_campeigns" id="successful_campeigns" type="text"
                class="form-control @error('successful_campeigns') is-invalid @enderror"
                value="{{ old('successful_campeigns', setting('successful_campeigns')) }}">
               <span class="text-danger">{{ $errors->first('successful_campeigns') }}</span>
            </div>

              <!--Ports  -->
             <div class="col-md-4 form-group">
                <label>Ports</label>
                <input name="ports" id="ports" type="text"
                class="form-control @error('ports') is-invalid @enderror"
                value="{{ old('ports', setting('ports')) }}">
               <span class="text-danger">{{ $errors->first('ports') }}</span>
            </div>

        <div class="col-md-12">
          <button type="submit" class="btn btn-outline-primary">Update</button>
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