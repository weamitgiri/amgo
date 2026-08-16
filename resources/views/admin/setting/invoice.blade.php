@php
    $invoiceGstin = setting('invoice_seller_gstin');
@endphp

@if (empty($invoiceGstin))
    <div class="alert alert-warning">
        <strong>GSTIN not configured.</strong>
        Until a valid GSTIN is saved here, downloaded documents are issued as a
        <em>Provisional Receipt</em> rather than a GST Tax Invoice — no GST identifier is ever
        printed unless it has been entered on this page.
    </div>
@endif

<form method="POST" action="{{ route('admin.settings.invoiceUpdate') }}" class="ajaxform" id="invoiceSettingsForm">
    @csrf
    <p class="text-muted small">
        These are the supplier ("Billed From") details printed on every GST invoice your customers download.
    </p>
    <div class="row">
        <div class="col-md-6 form-group">
            <label>Trading name</label>
            <input name="invoice_seller_name" type="text" class="form-control" placeholder="Zoventro"
                   value="{{ old('invoice_seller_name', setting('invoice_seller_name')) }}">
            <small class="form-text text-muted">Shown as the heading of the invoice.</small>
        </div>
        <div class="col-md-6 form-group">
            <label>Registered legal name</label>
            <input name="invoice_seller_legal_name" type="text" class="form-control"
                   value="{{ old('invoice_seller_legal_name', setting('invoice_seller_legal_name')) }}">
            <small class="form-text text-muted">The name exactly as registered under GST, if it differs from the trading name.</small>
        </div>
        <div class="col-md-6 form-group">
            <label>GSTIN</label>
            <input name="invoice_seller_gstin" type="text" class="form-control text-uppercase" maxlength="15"
                   placeholder="06AABCZ1234A1Z5"
                   value="{{ old('invoice_seller_gstin', $invoiceGstin) }}">
            <small class="form-text text-muted">15 characters. The state code is taken from the first two digits automatically.</small>
        </div>
        <div class="col-md-6 form-group">
            <label>Billing email</label>
            <input name="invoice_seller_email" type="email" class="form-control"
                   value="{{ old('invoice_seller_email', setting('invoice_seller_email')) }}">
        </div>
        <div class="col-md-12 form-group">
            <label>Registered address</label>
            <input name="invoice_seller_address" type="text" class="form-control"
                   value="{{ old('invoice_seller_address', setting('invoice_seller_address')) }}">
        </div>
        <div class="col-md-3 form-group">
            <label>City</label>
            <input name="invoice_seller_city" type="text" class="form-control"
                   value="{{ old('invoice_seller_city', setting('invoice_seller_city')) }}">
        </div>
        <div class="col-md-3 form-group">
            <label>State</label>
            <input name="invoice_seller_state" type="text" class="form-control"
                   value="{{ old('invoice_seller_state', setting('invoice_seller_state')) }}">
            <small class="form-text text-muted">Decides CGST+SGST vs IGST on each invoice.</small>
        </div>
        <div class="col-md-3 form-group">
            <label>State code</label>
            <input name="invoice_seller_state_code" type="text" class="form-control" maxlength="2" readonly
                   value="{{ old('invoice_seller_state_code', setting('invoice_seller_state_code')) }}">
            <small class="form-text text-muted">Derived from the GSTIN.</small>
        </div>
        <div class="col-md-3 form-group">
            <label>PIN code</label>
            <input name="invoice_seller_pin" type="text" class="form-control" maxlength="10"
                   value="{{ old('invoice_seller_pin', setting('invoice_seller_pin')) }}">
        </div>
        <div class="col-md-6 form-group">
            <label>Invoice number prefix</label>
            <input name="invoice_number_prefix" type="text" class="form-control" placeholder="ZV"
                   value="{{ old('invoice_number_prefix', setting('invoice_number_prefix', 'ZV')) }}">
            <small class="form-text text-muted">Invoices are numbered PREFIX/YEAR/00001.</small>
        </div>
        <div class="col-md-6 form-group">
            <label>GST rate (%)</label>
            <input name="invoice_gst_rate" type="number" step="0.01" min="0" max="100" class="form-control"
                   value="{{ old('invoice_gst_rate', setting('invoice_gst_rate', '18')) }}">
            <small class="form-text text-muted">Split in half as CGST + SGST for intra-state supply, or charged as IGST inter-state.</small>
        </div>
    </div>
    <div class="col-md-12">
        <button type="submit" class="btn btn-outline-primary">Update</button>
    </div>
</form>
