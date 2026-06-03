<form method="POST" action="{{ route('admin.settings.brandingUpdate') }}" class="ajaxform" enctype="multipart/form-data">
    @csrf
    <div class="row">
        <div class="col-md-6 form-group">
            <label>Logo Upload</label>
            <input type="file" class="form-control" name="logo" accept="image/*">
            @if(setting('logo'))
                <img class="img-thumbnail mt-2" style="max-height:70px;" src="{{ url('admin/showImage/storage/uploads/logo/'.setting('logo')) }}" alt="Logo">
            @endif
        </div>

        <div class="col-md-6 form-group">
            <label>Favicon Upload</label>
            <input type="file" class="form-control" name="favicon" accept="image/*">
            @if(setting('favicon'))
                <img class="img-thumbnail mt-2" style="max-height:70px;" src="{{ url('admin/showImage/storage/uploads/logo/'.setting('favicon')) }}" alt="Favicon">
            @endif
        </div>

        <div class="col-md-6 form-group">
            <label>Footer Logo</label>
            <input type="file" class="form-control" name="footer_logo" accept="image/*">
            @if(setting('footer_logo'))
                <img class="img-thumbnail mt-2" style="max-height:70px;" src="{{ url('admin/showImage/storage/uploads/logo/'.setting('footer_logo')) }}" alt="Footer Logo">
            @endif
        </div>

        <div class="col-md-6 form-group">
            <label>Login Page Logo</label>
            <input type="file" class="form-control" name="login_logo" accept="image/*">
            @if(setting('login_logo'))
                <img class="img-thumbnail mt-2" style="max-height:70px;" src="{{ url('admin/showImage/storage/uploads/logo/'.setting('login_logo')) }}" alt="Login Logo">
            @endif
        </div>
    </div>

    <div class="col-md-12">
        <button type="submit" class="btn btn-outline-primary">Update</button>
    </div>
</form>
