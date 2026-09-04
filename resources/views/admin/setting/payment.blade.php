@php
    use App\Http\Controllers\Admin\SettingController;

    // Credentials are read from the environment, never the database.
    $razorpayKeyId = config('services.razorpay.key');
    $razorpayKeySecret = config('services.razorpay.secret');
    $razorpayWebhookSecret = config('services.razorpay.webhook_secret');

    $razorpayConfigured = filled($razorpayKeyId) && filled($razorpayKeySecret);
    $razorpayMode = str_starts_with((string) $razorpayKeyId, 'rzp_live_') ? 'Live' : 'Test';
@endphp

<form method="POST" action="{{ route('admin.settings.paymentUpdate') }}" class="ajaxform" id="paymentSettingsForm">
    @csrf

    {{-- Credentials: read-only, environment-sourced, masked. --}}
    <div class="card card-outline card-secondary">
        <div class="card-header">
            <h3 class="card-title">Razorpay Credentials</h3>
            <div class="card-tools">
                @if($razorpayConfigured)
                    <span class="badge badge-{{ $razorpayMode === 'Live' ? 'danger' : 'warning' }}">
                        {{ $razorpayMode }} Mode
                    </span>
                @else
                    <span class="badge badge-secondary">Not Configured</span>
                @endif
            </div>
        </div>
        <div class="card-body">
            <div class="alert alert-info mb-3">
                <i class="fas fa-info-circle"></i>
                Razorpay credentials are read from the server environment
                (<code>.env</code>), not from this screen. To change them, update
                <code>RAZORPAY_KEY_ID</code>, <code>RAZORPAY_KEY_SECRET</code> and
                <code>RAZORPAY_WEBHOOK_SECRET</code> on the API server and restart it.
                Switching from test to live keys needs no code change.
            </div>

            <div class="row">
                <div class="col-md-4 form-group">
                    <label>Razorpay Key ID</label>
                    <input type="text" class="form-control" value="{{ SettingController::maskSecret($razorpayKeyId) }}" readonly>
                </div>
                <div class="col-md-4 form-group">
                    <label>Razorpay Key Secret</label>
                    {{-- Only ever a mask: the full secret is never rendered back
                         to an administrator, and never reaches the browser. --}}
                    <input type="text" class="form-control" value="{{ $razorpayKeySecret ? 'Configured ••••••••••••' : 'Not configured' }}" readonly>
                </div>
                <div class="col-md-4 form-group">
                    <label>Webhook Secret</label>
                    <input type="text" class="form-control" value="{{ $razorpayWebhookSecret ? 'Configured ••••••••••••' : 'Not configured' }}" readonly>
                    <small class="text-muted">Separate from the key secret.</small>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <label>Webhook URL to configure in the Razorpay Dashboard</label>
                    <input type="text" class="form-control" readonly
                           value="{{ rtrim(env('API_BASE_URL', config('app.url')), '/') }}/v1/webhooks/razorpay">
                    <small class="text-muted">
                        Subscribe to: <code>payment.captured</code>, <code>payment.failed</code>, <code>order.paid</code>.
                    </small>
                </div>
            </div>
        </div>
    </div>

    {{-- Method availability --}}
    <div class="card card-outline card-primary">
        <div class="card-header"><h3 class="card-title">Payment Methods</h3></div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6 form-group">
                    <div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input" id="razorpay_enabled"
                               name="payment_gateway_razorpay_enabled" value="1"
                               {{ setting('payment_gateway_razorpay_enabled', '1') == '1' ? 'checked' : '' }}>
                        <label class="custom-control-label" for="razorpay_enabled">
                            <strong>Razorpay</strong> — Online Payment
                        </label>
                    </div>
                    <small class="text-muted">
                        UPI, Cards, Net Banking and Wallets.
                        @unless($razorpayConfigured)
                            <span class="text-danger d-block">
                                Credentials are missing, so this stays hidden at checkout even when switched on.
                            </span>
                        @endunless
                    </small>
                </div>

                <div class="col-md-6 form-group">
                    <div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input" id="cod_enabled"
                               name="payment_gateway_cod_enabled" value="1"
                               {{ setting('payment_gateway_cod_enabled', '0') == '1' ? 'checked' : '' }}>
                        <label class="custom-control-label" for="cod_enabled">
                            <strong>Cash on Delivery</strong>
                        </label>
                    </div>
                    <small class="text-muted">
                        COD orders are activated immediately with payment left pending;
                        settle them from Payments once collected.
                    </small>
                </div>
            </div>

            <hr>

            <div class="row">
                <div class="col-md-12 form-group">
                    <label>Razorpay Instruments to Advertise</label>
                    <div class="mt-2">
                        <label class="mr-3">
                            <input type="checkbox" name="payment_option_upi" value="1"
                                   {{ setting('payment_option_upi', '1') == '1' ? 'checked' : '' }}> UPI
                        </label>
                        <label class="mr-3">
                            <input type="checkbox" name="payment_option_card" value="1"
                                   {{ setting('payment_option_card', '1') == '1' ? 'checked' : '' }}> Credit / Debit Card
                        </label>
                        <label class="mr-3">
                            <input type="checkbox" name="payment_option_net_banking" value="1"
                                   {{ setting('payment_option_net_banking', '1') == '1' ? 'checked' : '' }}> Net Banking
                        </label>
                        <label>
                            <input type="checkbox" name="payment_option_wallet" value="1"
                                   {{ setting('payment_option_wallet', '1') == '1' ? 'checked' : '' }}> Wallets
                        </label>
                    </div>
                    <small class="text-muted">
                        Controls the labels shown under the Razorpay option at checkout. What a
                        customer can actually pay with is governed by your Razorpay account.
                    </small>
                </div>
            </div>
        </div>
    </div>

    {{-- COD limits --}}
    <div class="card card-outline card-warning">
        <div class="card-header"><h3 class="card-title">Cash on Delivery Limits</h3></div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6 form-group">
                    <label>COD Minimum Order Amount (₹)</label>
                    <input type="number" step="0.01" min="0" name="payment_cod_min_amount" class="form-control"
                           value="{{ old('payment_cod_min_amount', setting('payment_cod_min_amount', '0')) }}">
                    <span class="text-danger">{{ $errors->first('payment_cod_min_amount') }}</span>
                </div>
                <div class="col-md-6 form-group">
                    <label>COD Maximum Order Amount (₹)</label>
                    <input type="number" step="0.01" min="0" name="payment_cod_max_amount" class="form-control"
                           value="{{ old('payment_cod_max_amount', setting('payment_cod_max_amount', '0')) }}">
                    <span class="text-danger">{{ $errors->first('payment_cod_max_amount') }}</span>
                </div>
                <div class="col-md-12">
                    <small class="text-muted">
                        Leave either at <strong>0</strong> for no limit. Enforced server-side at
                        checkout, not just hidden in the UI.
                    </small>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-12">
        <button type="submit" class="btn btn-outline-primary">Update</button>
    </div>
</form>
