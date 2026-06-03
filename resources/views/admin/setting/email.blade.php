<form method="POST" action="{{ route('admin.settings.emailUpdate') }}" class="ajaxform" id="emailSettingsForm">
    @csrf
    <div class="row">
        <div class="col-md-4 form-group">
            <label>Mail Driver <span class="text-danger">*</span></label>
            <input name="mail_driver" type="text" class="form-control" value="{{ old('mail_driver', setting('mail_driver', 'smtp')) }}">
        </div>
        <div class="col-md-4 form-group">
            <label>SMTP Host <span class="text-danger">*</span></label>
            <input name="smtp_host" type="text" class="form-control" value="{{ old('smtp_host', setting('smtp_host')) }}">
        </div>
        <div class="col-md-4 form-group">
            <label>SMTP Port <span class="text-danger">*</span></label>
            <input name="smtp_port" type="number" class="form-control" value="{{ old('smtp_port', setting('smtp_port', 587)) }}">
        </div>
        <div class="col-md-6 form-group">
            <label>SMTP Username <span class="text-danger">*</span></label>
            <input name="smtp_username" type="text" class="form-control" value="{{ old('smtp_username', setting('smtp_username')) }}">
        </div>
        <div class="col-md-6 form-group">
            <label>SMTP Password <span class="text-danger">*</span></label>
            <input name="smtp_password" type="text" class="form-control" value="{{ old('smtp_password', setting('smtp_password')) }}">
        </div>
        <div class="col-md-6 form-group">
            <label>From Email <span class="text-danger">*</span></label>
            <input name="from_email" type="email" class="form-control" value="{{ old('from_email', setting('from_email')) }}">
        </div>
        <div class="col-md-6 form-group">
            <label>From Name <span class="text-danger">*</span></label>
            <input name="from_name" type="text" class="form-control" value="{{ old('from_name', setting('from_name')) }}">
        </div>
    </div>
    <div class="col-md-12">
        <button type="submit" class="btn btn-outline-primary">Update</button>
    </div>
</form>
