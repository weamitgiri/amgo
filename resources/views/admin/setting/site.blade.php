
        <form method="POST" action="{{ route('admin.settings.updateSettings')}}" class="ajaxform" id="generalSettingsForm">
           @csrf
            <div class="row">
             <div class="col-md-6 form-group">
                <label>Website Name <span class="text-danger">*</span></label>
                <input name="website_name" type="text" class="form-control @error('website_name') is-invalid @enderror"
                value="{{ old('website_name', setting('website_name')) }}">
               <span class="text-danger">{{ $errors->first('website_name') }}</span>
            </div>

             <div class="col-md-6 form-group">
                <label>Website URL <span class="text-danger">*</span></label>
                <input name="website_url" type="url" class="form-control @error('website_url') is-invalid @enderror"
                value="{{ old('website_url', setting('website_url')) }}">
               <span class="text-danger">{{ $errors->first('website_url') }}</span>
            </div>

             <div class="col-md-6 form-group">
                <label>Tagline</label>
                <input name="tagline" type="text" class="form-control @error('tagline') is-invalid @enderror"
                value="{{ old('tagline', setting('tagline')) }}">
               <span class="text-danger">{{ $errors->first('tagline') }}</span>
            </div>

             <div class="col-md-6 form-group">
                <label>Admin Email <span class="text-danger">*</span></label>
                <input name="admin_email" type="email" class="form-control @error('admin_email') is-invalid @enderror"
                value="{{ old('admin_email', setting('admin_email')) }}">
               <span class="text-danger">{{ $errors->first('admin_email') }}</span>
            </div>

            <div class="col-md-6 form-group">
                <label>Support Email <span class="text-danger">*</span></label>
                <input name="support_email" type="email" class="form-control @error('support_email') is-invalid @enderror"
                value="{{ old('support_email', setting('support_email')) }}">
               <span class="text-danger">{{ $errors->first('support_email') }}</span>
              </div>

              <div class="col-md-6 form-group">
                <label>Contact Number <span class="text-danger">*</span></label>
                <input name="contact_number" type="text" class="form-control @error('contact_number') is-invalid @enderror"
                value="{{ old('contact_number', setting('contact_number')) }}">
               <span class="text-danger">{{ $errors->first('contact_number') }}</span>
              </div>

            <div class="col-md-6 form-group">
                <label>Timezone <span class="text-danger">*</span></label>
                <input name="timezone" type="text" class="form-control @error('timezone') is-invalid @enderror"
                value="{{ old('timezone', setting('timezone', 'Asia/Kolkata')) }}">
               <span class="text-danger">{{ $errors->first('timezone') }}</span>
              </div>

              <div class="col-md-6 form-group">
                <label>Date Format <span class="text-danger">*</span></label>
                <input name="date_format" type="text" class="form-control @error('date_format') is-invalid @enderror"
                value="{{ old('date_format', setting('date_format', 'd M Y')) }}">
               <span class="text-danger">{{ $errors->first('date_format') }}</span>
              </div>

              <div class="col-md-6 form-group">
                <label>Currency <span class="text-danger">*</span></label>
                <input name="currency" type="text" class="form-control @error('currency') is-invalid @enderror"
                value="{{ old('currency', setting('currency', 'INR')) }}">
               <span class="text-danger">{{ $errors->first('currency') }}</span>
              </div>

              <div class="col-md-6 form-group">
                <label>Company Address <span class="text-danger">*</span></label>
                <textarea class="form-control @error('company_address') is-invalid @enderror" name="company_address">{{ old('company_address', setting('company_address')) }}</textarea>
               <span class="text-danger">{{ $errors->first('company_address') }}</span>
              </div>

        </div>

         <div class="col-md-12">
            <button type="submit" class="btn btn-outline-primary">Update</button>
         </div>
</form>