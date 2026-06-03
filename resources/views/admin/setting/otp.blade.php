<form method="POST" action="{{ route('admin.settings.otpUpdate') }}" class="ajaxform" id="otpSettingsForm">
    @csrf
    <div class="row">
        <div class="col-md-4 form-group">
            <label>OTP Expiry Time (seconds) <span class="text-danger">*</span></label>
            <input name="otp_expiry_time" type="number" class="form-control" value="{{ old('otp_expiry_time', setting('otp_expiry_time', 300)) }}">
        </div>
        <div class="col-md-4 form-group">
            <label>OTP Resend Limit <span class="text-danger">*</span></label>
            <input name="otp_resend_limit" type="number" class="form-control" value="{{ old('otp_resend_limit', setting('otp_resend_limit', 3)) }}">
        </div>
        <div class="col-md-4 form-group">
            <label>OTP Retry Attempts <span class="text-danger">*</span></label>
            <input name="otp_retry_attempts" type="number" class="form-control" value="{{ old('otp_retry_attempts', setting('otp_retry_attempts', 5)) }}">
        </div>
    </div>
    <div class="col-md-12">
        <button type="submit" class="btn btn-outline-primary">Update</button>
    </div>
</form>
