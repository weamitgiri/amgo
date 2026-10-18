@php
    /** Laid out to match the GST invoice samples (same-state CGST+SGST / other-state IGST). */
    $s = $invoice['seller'];
    $b = $invoice['buyer'];
    $money = fn ($n) => 'Rs. ' . number_format((float) $n, 2);
    $rate = fn ($r) => rtrim(rtrim(number_format($r, 2, '.', ''), '0'), '.');
    $half = $rate($s['gst_rate'] / 2);
    $full = $rate($s['gst_rate']);
    $stateLine = fn ($state, $code) => $state ? $state . ($code ? " (Code {$code})" : '') : null;
    $sellerCityLine = trim(implode(', ', array_filter([
        $s['city'],
        $s['state'] ? $s['state'] . ($s['pin'] ? ' - ' . $s['pin'] : '') : null,
    ])));
    $buyerAddress = implode(', ', array_filter([
        $b['address'],
        $b['city'],
        $b['state'] ? $b['state'] . ($b['pin'] ? ' - ' . $b['pin'] : '') : null,
    ]));
@endphp
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>{{ $invoice['invoice_no'] }}</title>
<style>
    @page { margin: 54px 60px; }
    body { font-family: Helvetica, Arial, sans-serif; color: #111; font-size: 10px; line-height: 1.45; }
    .brand { font-size: 24px; font-weight: bold; margin: 0; line-height: 1.1; }
    .tagline { color: #666; font-size: 10px; margin-top: 2px; }
    .doc-title { color: #1a6cf5; font-size: 16px; font-weight: bold; margin: 26px 0 16px; }
    table { border-collapse: collapse; }
    .top td { vertical-align: top; padding: 0; }
    .meta { text-align: right; }
    .meta b { font-weight: bold; }
    h3 { font-size: 13px; margin: 24px 0 10px; }
    .items { width: 100%; margin-top: 16px; }
    .items th { background: #1a6cf5; color: #fff; font-weight: bold; text-align: right; padding: 10px 6px; border: 1px solid #1a6cf5; border-right-color: #fff; line-height: 1.3; }
    .items th:last-child { border-right-color: #1a6cf5; }
    .items th.l { text-align: left; }
    .items td { padding: 10px 6px; border: 1px solid #ddd; text-align: right; vertical-align: middle; }
    .items td.l { text-align: left; }
    .totals { width: 55%; margin-left: 45%; }
    .totals td { padding: 5px 0 5px 10px; font-size: 10.5px; }
    .totals td.v { text-align: right; padding-right: 0; }
    .totals tr.grand td { border-top: 1px solid #555; font-size: 13px; font-weight: bold; padding-top: 7px; }
    .nature { margin-top: 22px; }
    .muted { color: #666; margin-top: 12px; }
    .warn { color: #b91c1c; font-weight: bold; margin-top: 10px; }
</style>
</head>
<body>
    <div class="brand">{{ $s['name'] }}</div>
    <div class="tagline">Corporate Team Activity Platform</div>

    <div class="doc-title">{{ $s['is_gst_registered'] ? 'TAX INVOICE' : 'PROVISIONAL RECEIPT' }}</div>

    <table class="top" style="width:100%;">
        <tr>
            <td style="width:50%;">
                <b>{{ $s['legal_name'] ?: $s['name'] }}</b><br>
                @if($s['proprietor'])Proprietor: {{ $s['proprietor'] }}<br>@endif
                @if($s['address']){{ $s['address'] }}<br>@endif
                @if($sellerCityLine){{ $sellerCityLine }}<br>@endif
                @if($s['is_gst_registered'])GSTIN: {{ $s['gstin'] }}<br>@endif
                @if($stateLine($s['state'], $s['state_code'])){{ 'State: ' . $stateLine($s['state'], $s['state_code']) }}<br>@endif
                @if($s['email'])Email: {{ $s['email'] }}@endif
            </td>
            <td class="meta" style="width:50%;">
                <b>Invoice No:</b> {{ $invoice['invoice_no'] }}<br>
                <b>Invoice Date:</b> {{ $invoice['invoice_date']->format('d-M-Y') }}<br>
                <b>Place of Supply:</b> {{ $b['state'] ? $b['state'] . ($b['state_code'] ? ' (' . $b['state_code'] . ')' : '') : '-' }}<br>
                <b>Payment Mode:</b> {{ $invoice['payment_mode'] }}<br>
                <b>Package:</b> {{ $invoice['package_name'] }}
            </td>
        </tr>
    </table>

    <h3>Billed To</h3>
    <div>
        <b>{{ $b['name'] }}</b><br>
        @if($b['contact'])Attn: {{ $b['contact'] }}<br>@endif
        @if($buyerAddress){{ $buyerAddress }}<br>@endif
        @if($b['gstin'])GSTIN: {{ $b['gstin'] }}<br>@endif
        @if($stateLine($b['state'], $b['state_code'])){{ 'State: ' . $stateLine($b['state'], $b['state_code']) }}<br>@endif
        @if($b['email'])Email: {{ $b['email'] }}@endif
    </div>

    <table class="items">
        <thead>
            <tr>
                <th class="l" style="width:5%;">#</th>
                <th class="l" style="width:33%;">Description</th>
                <th style="width:15%;">Taxable<br>Value</th>
                @if($invoice['is_intra_state'])
                    <th style="width:13%;">CGST<br>({{ $half }}%)</th>
                    <th style="width:13%;">SGST<br>({{ $half }}%)</th>
                @else
                    <th style="width:13%;">IGST<br>({{ $full }}%)</th>
                    <th style="width:13%;"></th>
                @endif
                <th style="width:17%;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="l">1</td>
                <td class="l">{{ $invoice['description'] }}</td>
                <td>{{ $money($invoice['taxable_value']) }}</td>
                @if($invoice['is_intra_state'])
                    <td>{{ $money($invoice['cgst']) }}</td>
                    <td>{{ $money($invoice['sgst']) }}</td>
                @else
                    <td>{{ $money($invoice['gst_amount']) }}</td>
                    <td></td>
                @endif
                <td>{{ $money($invoice['total_payable']) }}</td>
            </tr>
        </tbody>
    </table>

    <table class="totals">
        <tr><td>Taxable Value</td><td class="v">{{ $money($invoice['taxable_value']) }}</td></tr>
        @if($invoice['additional_charges'] > 0)
            <tr><td>Additional Charges</td><td class="v">{{ $money($invoice['additional_charges']) }}</td></tr>
        @endif
        @if($invoice['is_intra_state'])
            <tr><td>CGST @ {{ $half }}%</td><td class="v">{{ $money($invoice['cgst']) }}</td></tr>
            <tr><td>SGST @ {{ $half }}%</td><td class="v">{{ $money($invoice['sgst']) }}</td></tr>
        @else
            <tr><td>IGST @ {{ $full }}%</td><td class="v">{{ $money($invoice['gst_amount']) }}</td></tr>
        @endif
        <tr><td>Round Off</td><td class="v">{{ $money($invoice['round_off']) }}</td></tr>
        <tr class="grand"><td>Total Payable</td><td class="v">{{ $money($invoice['total_payable']) }}</td></tr>
    </table>

    <div class="nature">
        <b>Nature of Supply:</b>
        @if($invoice['is_intra_state'])
            Intra-State Supply &mdash; Supplier and recipient are both located in {{ $b['state'] }}. CGST and SGST charged in equal parts as per Section 8 of the CGST Act, 2017.
        @else
            Inter-State Supply &mdash; Supplier is located in {{ $s['state'] ?: '-' }} and recipient is located in {{ $b['state'] ?: '-' }}. IGST charged as per Section 7 of the IGST Act, 2017.
        @endif
    </div>

    @if(!$invoice['is_paid'])
        <div class="warn">Payment status: {{ strtoupper($invoice['payment_status']) }} &mdash; this document is not a receipt of payment.</div>
    @endif
    @if(!$s['is_gst_registered'])
        <div class="warn">Supplier GST details are not configured, so this document is issued as a provisional receipt and is not a valid tax invoice.</div>
    @endif

    <div class="muted">This is a system-generated invoice and does not require a physical signature. This invoice will remain available for download for 7 years from the date of issue, as required under the GST Act.</div>
    <div class="muted">Thank you for choosing {{ $s['name'] }}.</div>
</body>
</html>
