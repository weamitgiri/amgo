<form method="POST" action="{{ route('admin.settings.updateSettings') }}" class="ajaxform" id="socialSettingsForm">
    @csrf
    <div class="row">
        <div class="col-md-6 form-group">
            <label><i class="fab fa-facebook text-primary mr-1"></i> Facebook URL</label>
            <input name="facebook_url" type="url" class="form-control" placeholder="https://facebook.com/yourpage"
            value="{{ old('facebook_url', setting('facebook_url')) }}">
        </div>

        <div class="col-md-6 form-group">
            <label><i class="fab fa-instagram text-danger mr-1"></i> Instagram URL</label>
            <input name="instagram_url" type="url" class="form-control" placeholder="https://instagram.com/yourprofile"
            value="{{ old('instagram_url', setting('instagram_url')) }}">
        </div>

        <div class="col-md-6 form-group">
            <label><i class="fab fa-whatsapp text-success mr-1"></i> WhatsApp Number</label>
            <input name="whatsapp_number" type="text" class="form-control" placeholder="e.g. +919876543210"
            value="{{ old('whatsapp_number', setting('whatsapp_number')) }}">
        </div>

        <div class="col-md-6 form-group">
            <label><i class="fab fa-twitter text-info mr-1"></i> Twitter (X) URL</label>
            <input name="twitter_url" type="url" class="form-control" placeholder="https://twitter.com/yourprofile"
            value="{{ old('twitter_url', setting('twitter_url')) }}">
        </div>

        <div class="col-md-6 form-group">
            <label><i class="fab fa-linkedin text-primary mr-1"></i> LinkedIn URL</label>
            <input name="linkedin_url" type="url" class="form-control" placeholder="https://linkedin.com/in/yourprofile"
            value="{{ old('linkedin_url', setting('linkedin_url')) }}">
        </div>
        
        <div class="col-md-6 form-group">
            <label><i class="fab fa-youtube text-danger mr-1"></i> YouTube URL</label>
            <input name="youtube_url" type="url" class="form-control" placeholder="https://youtube.com/@yourchannel"
            value="{{ old('youtube_url', setting('youtube_url')) }}">
        </div>
    </div>

    <div class="col-md-12">
        <button type="submit" class="btn btn-outline-primary">Update Social Links</button>
    </div>
</form>
