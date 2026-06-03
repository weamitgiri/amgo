<div class="card-body p-0">
    @php
        $organizer = $organizer ?? null;
        $booking = $booking ?? null;
        $billing = $booking?->billing;

        // If validation fails, jump user to the step containing the first error.
        $initialStep = 1;
        $errorKeys = $errors->keys();
        if (!empty($errorKeys)) {
            $firstKey = (string) $errorKeys[0];
            if (str_starts_with($firstKey, 'activity_id') || str_starts_with($firstKey, 'package_id') || str_starts_with($firstKey, 'scheduled_')) {
                $initialStep = 2;
            } elseif (str_starts_with($firstKey, 'gst_number') || str_starts_with($firstKey, 'billing_') || in_array($firstKey, ['city', 'state', 'pin_code', 'package_price', 'taxes', 'gst_amount', 'total_payable', 'status'], true)) {
                $initialStep = 3;
            } elseif (str_starts_with($firstKey, 'payment_method') || str_starts_with($firstKey, 'confirmation_details')) {
                $initialStep = 4;
            }
        }
    @endphp

    @if($errors->any())
        <div class="p-4">
            <div class="alert alert-danger mb-0">
                <div class="d-flex align-items-start">
                    <i class="fas fa-exclamation-triangle mr-2 mt-1"></i>
                    <div>
                        <div class="font-weight-bold">Please fix the highlighted fields.</div>
                        <ul class="mb-0 pl-3">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <!-- Custom Step Wizard Header -->
    <div class="bs-stepper">
        <div class="bs-stepper-header" role="tablist">
            <div class="step active" data-target="#step1">
                <button type="button" class="step-trigger" role="tab" aria-controls="step1" id="step1-trigger">
                    <span class="bs-stepper-circle">1</span>
                    <span class="bs-stepper-label">Contact Details</span>
                </button>
            </div>
            <div class="line"></div>
            <div class="step" data-target="#step2">
                <button type="button" class="step-trigger" role="tab" aria-controls="step2" id="step2-trigger">
                    <span class="bs-stepper-circle">2</span>
                    <span class="bs-stepper-label">Activity & Schedule</span>
                </button>
            </div>
            <div class="line"></div>
            <div class="step" data-target="#step3">
                <button type="button" class="step-trigger" role="tab" aria-controls="step3" id="step3-trigger">
                    <span class="bs-stepper-circle">3</span>
                    <span class="bs-stepper-label">Billing</span>
                </button>
            </div>
            <div class="line"></div>
            <div class="step" data-target="#step4">
                <button type="button" class="step-trigger" role="tab" aria-controls="step4" id="step4-trigger">
                    <span class="bs-stepper-circle">4</span>
                    <span class="bs-stepper-label">Payment</span>
                </button>
            </div>
        </div>

        <div class="bs-stepper-content p-4">
            <!-- STEP 1: CONTACT DETAILS -->
            <div id="step1" class="step-content active" role="tabpanel" aria-labelledby="step1-trigger">
                <div class="card card-outline card-info">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-user-tie mr-2"></i>Primary Contact Information</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="name">Full Name <span class="text-danger">*</span></label>
                                    <input type="text" name="name" id="name" class="form-control @error('name') is-invalid @enderror" value="{{ old('name', $organizer?->name ?? '') }}" placeholder="Enter full name" required>
                                    @error('name')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="email">Email Address <span class="text-danger">*</span></label>
                                    <input type="email" name="email" id="email" class="form-control @error('email') is-invalid @enderror" value="{{ old('email', $organizer?->email ?? '') }}" placeholder="Enter email address" required>
                                    @error('email')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="company_name">Company Name <span class="text-danger">*</span></label>
                                    <input type="text" name="company_name" id="company_name" class="form-control @error('company_name') is-invalid @enderror" value="{{ old('company_name', $organizer?->company_name ?? '') }}" placeholder="Enter company name" required>
                                    @error('company_name')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="company_website">Company Website</label>
                                    <input type="url" name="company_website" id="company_website" class="form-control @error('company_website') is-invalid @enderror" value="{{ old('company_website', $organizer?->company_website ?? '') }}" placeholder="https://example.com">
                                    @error('company_website')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-right mt-3">
                    <button type="button" class="btn btn-primary next-step px-4">Next <i class="fas fa-arrow-right ml-1"></i></button>
                </div>
            </div>

            <!-- STEP 2: ACTIVITY & SCHEDULE -->
            <div id="step2" class="step-content" role="tabpanel" aria-labelledby="step2-trigger">
                <div class="card card-outline card-secondary">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-calendar-alt mr-2"></i>Select Activity & Schedule</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="activity_id">Activity <span class="text-danger">*</span></label>
                                    <select name="activity_id" id="activity_id" class="form-control select2 @error('activity_id') is-invalid @enderror" required>
                                        <option value="">Select Activity</option>
                                        @foreach($activities as $activity)
                                            <option value="{{ $activity->id }}" {{ (old('activity_id', $booking?->activity_id ?? '') == $activity->id) ? 'selected' : '' }}>{{ $activity->title }}</option>
                                        @endforeach
                                    </select>
                                    @error('activity_id')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="package_id">Package <span class="text-danger">*</span></label>
                                    <select name="package_id" id="package_id" class="form-control select2 @error('package_id') is-invalid @enderror" required>
                                        <option value="">Select Package</option>
                                        @foreach($packages as $package)
                                            <option value="{{ $package->id }}" data-price="{{ $package->price }}" {{ (old('package_id', $booking?->package_id ?? '') == $package->id) ? 'selected' : '' }}>{{ $package->name }} (₹{{ $package->price }})</option>
                                        @endforeach
                                    </select>
                                    @error('package_id')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="scheduled_date">Scheduled Date <span class="text-danger">*</span></label>
                                    <input type="date" name="scheduled_date" id="scheduled_date" class="form-control @error('scheduled_date') is-invalid @enderror" value="{{ old('scheduled_date', $booking?->scheduled_date ?? '') }}" required min="{{ date('Y-m-d') }}">
                                    @error('scheduled_date')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="scheduled_time">Scheduled Time <span class="text-danger">*</span></label>
                                    <input type="time" name="scheduled_time" id="scheduled_time" class="form-control @error('scheduled_time') is-invalid @enderror" value="{{ old('scheduled_time', $booking?->scheduled_time ?? '') }}" required>
                                    @error('scheduled_time')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-between mt-3">
                    <button type="button" class="btn btn-secondary prev-step px-4"><i class="fas fa-arrow-left mr-1"></i> Previous</button>
                    <button type="button" class="btn btn-primary next-step px-4">Next <i class="fas fa-arrow-right ml-1"></i></button>
                </div>
            </div>

            <!-- STEP 3: BILLING -->
            <div id="step3" class="step-content" role="tabpanel" aria-labelledby="step3-trigger">
                <div class="card card-outline card-warning">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-file-invoice-dollar mr-2"></i>Billing & Pricing</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="gst_number">GST Number (Optional)</label>
                                    <input type="text" name="gst_number" id="gst_number" class="form-control @error('gst_number') is-invalid @enderror" value="{{ old('gst_number', $billing?->gst_number ?? '') }}" placeholder="Enter GSTIN">
                                    @error('gst_number')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="pin_code">PIN Code <span class="text-danger">*</span></label>
                                    <input type="text" name="pin_code" id="pin_code" class="form-control @error('pin_code') is-invalid @enderror" value="{{ old('pin_code', $billing?->pin_code ?? '') }}" placeholder="6-digit PIN" required>
                                    @error('pin_code')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label for="city">City <span class="text-danger">*</span></label>
                                    <input type="text" name="city" id="city" class="form-control @error('city') is-invalid @enderror" value="{{ old('city', $billing?->city ?? '') }}" placeholder="City" required>
                                    @error('city')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label for="state">State <span class="text-danger">*</span></label>
                                    <input type="text" name="state" id="state" class="form-control @error('state') is-invalid @enderror" value="{{ old('state', $billing?->state ?? '') }}" placeholder="State" required>
                                    @error('state')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label for="status">Account Status <span class="text-danger">*</span></label>
                                    <select name="status" id="status" class="form-control @error('status') is-invalid @enderror">
                                        <option value="active" {{ old('status', $organizer?->status ?? 'active') == 'active' ? 'selected' : '' }}>Active</option>
                                        <option value="inactive" {{ old('status', $organizer?->status ?? '') == 'inactive' ? 'selected' : '' }}>Inactive</option>
                                    </select>
                                    @error('status')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label for="billing_address">Billing Address <span class="text-danger">*</span></label>
                                    <textarea name="billing_address" id="billing_address" class="form-control @error('billing_address') is-invalid @enderror" rows="2" placeholder="Full address" required>{{ old('billing_address', $billing?->billing_address ?? '') }}</textarea>
                                    @error('billing_address')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                        </div>

                        <hr>
                        <h5><i class="fas fa-calculator mr-2"></i>Pricing Summary</h5>
                        <div class="row bg-light p-3 rounded">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Package Price (₹)</label>
                                    <input type="number" name="package_price" id="package_price" class="form-control @error('package_price') is-invalid @enderror" value="{{ old('package_price', $billing?->package_price ?? 0) }}" readonly>
                                    @error('package_price')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Taxes (18%) (₹)</label>
                                    <input type="number" name="taxes" id="taxes" class="form-control @error('taxes') is-invalid @enderror" value="{{ old('taxes', $billing?->taxes ?? 0) }}" readonly>
                                    @error('taxes')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                    <input type="hidden" name="gst_amount" id="gst_amount" value="{{ old('gst_amount', $billing?->gst_amount ?? 0) }}">
                                    @error('gst_amount')<span class="invalid-feedback d-block"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Total Payable (₹)</label>
                                    <input type="number" name="total_payable" id="total_payable" class="form-control form-control-lg text-primary font-weight-bold @error('total_payable') is-invalid @enderror" value="{{ old('total_payable', $billing?->total_payable ?? 0) }}" readonly>
                                    @error('total_payable')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-between mt-3">
                    <button type="button" class="btn btn-secondary prev-step px-4"><i class="fas fa-arrow-left mr-1"></i> Previous</button>
                    <button type="button" class="btn btn-primary next-step px-4">Next <i class="fas fa-arrow-right ml-1"></i></button>
                </div>
            </div>

            <!-- STEP 4: PAYMENT -->
            <div id="step4" class="step-content" role="tabpanel" aria-labelledby="step4-trigger">
                <div class="card card-outline card-success">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-credit-card mr-2"></i>Payment Confirmation</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="payment_method">Payment Method <span class="text-danger">*</span></label>
                                    <select name="payment_method" id="payment_method" class="form-control @error('payment_method') is-invalid @enderror" required>
                                        <option value="bank_transfer" {{ old('payment_method', $billing?->payment_method ?? '') == 'bank_transfer' ? 'selected' : '' }}>Bank Transfer</option>
                                        <option value="upi" {{ old('payment_method', $billing?->payment_method ?? '') == 'upi' ? 'selected' : '' }}>UPI / QR</option>
                                        <option value="card" {{ old('payment_method', $billing?->payment_method ?? '') == 'card' ? 'selected' : '' }}>Credit/Debit Card</option>
                                        <option value="cash" {{ old('payment_method', $billing?->payment_method ?? '') == 'cash' ? 'selected' : '' }}>Cash (Admin Only)</option>
                                    </select>
                                    @error('payment_method')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label>Transaction/Reference Details</label>
                                    <div id="confirmation-details-container">
                                        @php 
                                            $details = old('confirmation_details', $billing?->confirmation_details ?? []);
                                            if(empty($details)) $details = ['Reference ID', 'Bank Name', 'Date', 'Amount', 'Remarks'];
                                        @endphp
                                        @foreach($details as $key => $value)
                                            <div class="input-group mb-2">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text">{{ is_numeric($key) ? $value : $key }}</span>
                                                </div>
                                                <input type="text" name="confirmation_details[{{ is_numeric($key) ? $value : $key }}]" class="form-control" value="{{ is_numeric($key) ? '' : $value }}" required>
                                            </div>
                                        @endforeach
                                    </div>
                                    @error('confirmation_details')<span class="invalid-feedback d-block"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-secondary prev-step px-4"><i class="fas fa-arrow-left mr-1"></i> Previous</button>
                    <button type="submit" class="btn btn-success btn-lg px-5">
                        <i class="fas fa-check-circle mr-2"></i>{{ isset($organizer) ? 'Update' : 'Create' }} Organizer
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

@section('header_css')
<style>
    .bs-stepper-header { display: flex; align-items: center; justify-content: center; background: #f4f6f9; border-bottom: 1px solid #dee2e6; }
    .bs-stepper .step-trigger { padding: 1.5rem 1rem; border: none; background: none; display: flex; flex-direction: column; align-items: center; opacity: 0.5; transition: all 0.3s; }
    .bs-stepper .step.active .step-trigger { opacity: 1; color: #007bff; }
    .bs-stepper .bs-stepper-circle { width: 35px; height: 35px; border-radius: 50%; background: #6c757d; color: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; font-weight: bold; }
    .bs-stepper .step.active .bs-stepper-circle { background: #007bff; box-shadow: 0 0 10px rgba(0,123,255,0.4); }
    .bs-stepper .bs-stepper-label { font-size: 0.9rem; font-weight: 600; }
    .bs-stepper .line { flex: 1; height: 1px; background: #dee2e6; margin-top: -2rem; }
    .step-content { display: none; }
    .step-content.active { display: block; animation: fadeIn 0.5s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
@endsection

@section('footer_js')
<script>
    $(function() {
        // Step Wizard Logic
        let currentStep = 1;
        const totalSteps = 4;

        function showStep(step) {
            $('.step-content').removeClass('active');
            $(`#step${step}`).addClass('active');
            $('.step').removeClass('active');
            $(`.step[data-target="#step${step}"]`).addClass('active');
            currentStep = step;
            window.scrollTo(0, 0);
        }

        $('.next-step').click(function() {
            if (currentStep < totalSteps) showStep(currentStep + 1);
        });

        $('.prev-step').click(function() {
            if (currentStep > 1) showStep(currentStep - 1);
        });

        $('.step-trigger').click(function() {
            const target = $(this).closest('.step').data('target');
            const step = parseInt(target.replace('#step', ''));
            showStep(step);
        });

        // Pricing Calculation
        function calculatePricing() {
            const selectedPackage = $('#package_id option:selected');
            const price = parseFloat(selectedPackage.data('price')) || 0;
            const gstRate = 0.18;
            const gstAmount = price * gstRate;
            const total = price + gstAmount;

            $('#package_price').val(price.toFixed(2));
            $('#gst_amount').val(gstAmount.toFixed(2));
            $('#taxes').val(gstAmount.toFixed(2));
            $('#total_payable').val(total.toFixed(2));
        }

        $('#package_id').change(calculatePricing);
        if ($('#package_id').val()) calculatePricing();

        // Open the step that contains the first validation error (if any).
        const initialStep = {{ (int) ($initialStep ?? 1) }};
        showStep(initialStep);
    });
</script>
@endsection
