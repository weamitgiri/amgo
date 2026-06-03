<form method="POST" action="{{ route('admin.settings.paymentUpdate') }}" class="ajaxform" id="paymentSettingsForm">
    @csrf
    <div class="row">
        <div class="col-md-6 form-group">
            <label>Razorpay Key ID</label>
            <input name="razorpay_key_id" type="text" class="form-control" value="{{ old('razorpay_key_id', setting('razorpay_key_id')) }}">
        </div>
        <div class="col-md-6 form-group">
            <label>Razorpay Key Secret</label>
            <input name="razorpay_key_secret" type="text" class="form-control" value="{{ old('razorpay_key_secret', setting('razorpay_key_secret')) }}">
        </div>
        <div class="col-md-6 form-group">
            <label>Stripe Key</label>
            <input name="stripe_key" type="text" class="form-control" value="{{ old('stripe_key', setting('stripe_key')) }}">
        </div>
        <div class="col-md-6 form-group">
            <label>Stripe Secret</label>
            <input name="stripe_secret" type="text" class="form-control" value="{{ old('stripe_secret', setting('stripe_secret')) }}">
        </div>
        <div class="col-md-4 form-group">
            <label>Mode</label>
            <select name="payment_mode" class="form-control">
                <option value="test" {{ setting('payment_mode', 'test') === 'test' ? 'selected' : '' }}>Test</option>
                <option value="live" {{ setting('payment_mode') === 'live' ? 'selected' : '' }}>Live</option>
            </select>
        </div>
        <div class="col-md-8 form-group">
            <label>Payment Options</label>
            <div class="mt-2">
                <label class="mr-3"><input type="checkbox" name="payment_option_upi" value="1" {{ setting('payment_option_upi', '1') == '1' ? 'checked' : '' }}> UPI</label>
                <label class="mr-3"><input type="checkbox" name="payment_option_card" value="1" {{ setting('payment_option_card', '1') == '1' ? 'checked' : '' }}> Card</label>
                <label><input type="checkbox" name="payment_option_net_banking" value="1" {{ setting('payment_option_net_banking', '1') == '1' ? 'checked' : '' }}> Net Banking</label>
            </div>
        </div>
    </div>
    <div class="col-md-12">
        <button type="submit" class="btn btn-outline-primary">Update</button>
    </div>
</form>
