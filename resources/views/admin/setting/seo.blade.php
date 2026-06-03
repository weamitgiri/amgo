
        <form method="POST" action="{{ route('admin.settings.SeoupdateSettings')}}" class="ajaxform" id="seoSettingsForm" enctype="multipart/form-data">
           @csrf
            <div class="row">
         
             <!--meta_title  -->
             <div class="col-md-4 form-group">
                <label>Meta Title</label>
                <input name="meta_title" id="meta_title" type="text"
                class="form-control @error('meta_title') is-invalid @enderror"
                value="{{ old('meta_title', setting('meta_title')) }}">
               <span class="text-danger">{{ $errors->first('meta_title') }}</span>
            </div>


                    <!--meta_keywords  -->
             <div class="col-md-4 form-group">
                <label>Meta Keywords</label>
                <input name="meta_keywords" id="meta_keywords" type="text"
                class="form-control @error('meta_keywords') is-invalid @enderror"
                value="{{ old('meta_keywords', setting('meta_keywords')) }}">
               <span class="text-danger">{{ $errors->first('meta_keywords') }}</span>
            </div>

            
             <!--meta_description  -->
             <div class="col-md-4 form-group">
                <label>Meta Description</label>
                <input name="meta_description" id="meta_description" type="text"
                class="form-control @error('meta_description') is-invalid @enderror"
                value="{{ old('meta_description', setting('meta_description')) }}">
               <span class="text-danger">{{ $errors->first('meta_description') }}</span>
            </div>

            <div class="col-md-6 form-group">
                <label>OG Image</label>
                <input type="file" class="form-control" name="og_image" accept="image/*">
                @if(setting('og_image'))
                    <img class="img-thumbnail mt-2" style="max-height:80px;" src="{{ url('admin/showImage/storage/uploads/logo/'.setting('og_image')) }}" alt="OG Image">
                @endif
            </div>

            <div class="col-md-6 form-group">
                <label>Google Analytics Code</label>
                <textarea name="google_analytics_code" class="form-control" rows="4">{{ old('google_analytics_code', setting('google_analytics_code')) }}</textarea>
            </div>

            <div class="col-md-12 form-group">
                <label>Facebook Pixel Code</label>
                <textarea name="facebook_pixel_code" class="form-control" rows="4">{{ old('facebook_pixel_code', setting('facebook_pixel_code')) }}</textarea>
            </div>

</div>


       






 <div class="col-md-12">
          <button type="submit" class="btn btn-outline-primary">Update</button>
      </div>
  </form> 

      
 

