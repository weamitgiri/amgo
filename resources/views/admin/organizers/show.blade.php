@extends('admin.layouts.default')

@php
    $label = fn ($v) => $v ? ucwords(str_replace('_', ' ', $v)) : '-';
    $statusColor = fn ($v) => match ($v) {
        'active', 'paid', 'captured', 'completed' => 'success',
        'pending', 'pending_activation', 'authorized' => 'warning',
        'failed', 'cancelled', 'expired', 'inactive' => 'danger',
        'refunded' => 'info',
        default => 'secondary',
    };
    $inr = fn ($n) => '₹' . number_format((float) $n, 2);
    $sellerState = strtolower(trim((string) setting('invoice_seller_state', '')));
    $gstRate = (float) (setting('invoice_gst_rate') ?: 18);
    $rate = fn ($r) => rtrim(rtrim(number_format($r, 2, '.', ''), '0'), '.');
    $hasBilling = $organizer->bookings->contains(fn ($b) => $b->billing);
@endphp

@section('header_css')
<style>
    .detail-list { margin-bottom: 0; }
    .detail-list dt { color: #6c757d; font-weight: 500; }
    .detail-list dd { word-break: break-word; }
    .section-title { font-size: .8rem; text-transform: uppercase; letter-spacing: .04em; color: #6c757d; font-weight: 700; margin-bottom: .75rem; }
    .booking-card .card-header { background: #f8f9fa; }
    .amount-table th { font-weight: 500; color: #495057; }
    .confirm-list li { margin-bottom: .25rem; }
</style>
@endsection

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Organizer Details</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.organizers.index') }}">Organizers</a></li>
                        <li class="breadcrumb-item active">#{{ $organizer->id }}</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            @include('admin.alert_message')
            <div class="row">
                {{-- Registration details --}}
                <div class="col-lg-4">
                    <div class="card card-primary card-outline">
                        <div class="card-body box-profile">
                            <div class="text-center">
                                <img class="profile-user-img img-fluid img-circle"
                                     src="https://ui-avatars.com/api/?name={{ urlencode($organizer->name) }}&background=0D8ABC&color=fff"
                                     alt="{{ $organizer->name }}">
                            </div>
                            <h3 class="profile-username text-center mb-0">{{ $organizer->name }}</h3>
                            <p class="text-muted text-center">
                                {{ $organizer->designation ? $organizer->designation . ' · ' : '' }}{{ $organizer->company_name }}
                            </p>

                            <div class="section-title">Registration Details</div>
                            <dl class="row detail-list">
                                <dt class="col-5">Organizer ID</dt><dd class="col-7">#{{ $organizer->id }}</dd>
                                <dt class="col-5">Full Name</dt><dd class="col-7">{{ $organizer->name }}</dd>
                                <dt class="col-5">Email</dt><dd class="col-7"><a href="mailto:{{ $organizer->email }}">{{ $organizer->email }}</a></dd>
                                <dt class="col-5">Phone</dt><dd class="col-7">{{ $organizer->phone ?: '-' }}</dd>
                                <dt class="col-5">Designation</dt><dd class="col-7">{{ $organizer->designation ?: '-' }}</dd>
                                <dt class="col-5">Company</dt><dd class="col-7">{{ $organizer->company_name ?: '-' }}</dd>
                                <dt class="col-5">Website</dt>
                                <dd class="col-7">
                                    @if($organizer->company_website)
                                        <a href="{{ $organizer->company_website }}" target="_blank" rel="noopener noreferrer">{{ $organizer->company_website }}</a>
                                    @else
                                        -
                                    @endif
                                </dd>
                                <dt class="col-5">Email Verified</dt>
                                <dd class="col-7">
                                    @if($organizer->email_verified_at)
                                        <i class="fas fa-check-circle text-success"></i> {{ $organizer->email_verified_at->format('d M Y, h:i A') }}
                                    @else
                                        <span class="text-muted">Not verified</span>
                                    @endif
                                </dd>
                                <dt class="col-5">Status</dt>
                                <dd class="col-7"><span class="badge badge-{{ $statusColor($organizer->status) }}">{{ $label($organizer->status) }}</span></dd>
                                <dt class="col-5">Account</dt>
                                <dd class="col-7"><span class="badge badge-{{ $statusColor($organizer->account_status) }}">{{ $label($organizer->account_status) }}</span></dd>
                                <dt class="col-5">Payment</dt>
                                <dd class="col-7"><span class="badge badge-{{ $statusColor($organizer->payment_status) }}">{{ $label($organizer->payment_status) }}</span></dd>
                                <dt class="col-5">Registered On</dt><dd class="col-7">{{ optional($organizer->created_at)->format('d M Y, h:i A') ?? '-' }}</dd>
                                <dt class="col-5">Last Updated</dt><dd class="col-7">{{ optional($organizer->updated_at)->format('d M Y, h:i A') ?? '-' }}</dd>
                            </dl>

                            <div class="mt-3">
                                @if($hasBilling)
                                    <a href="{{ route('admin.organizers.invoice', $organizer->id) }}" class="btn btn-success btn-block">
                                        <i class="fas fa-file-pdf mr-1"></i> Download Invoice PDF
                                    </a>
                                @else
                                    <button type="button" class="btn btn-outline-secondary btn-block" disabled>
                                        <i class="fas fa-file-pdf mr-1"></i> No invoice (no billing details)
                                    </button>
                                @endif
                                <div class="d-flex mt-2">
                                    <a href="{{ route('admin.organizers.index') }}" class="btn btn-outline-secondary flex-fill mr-2">
                                        <i class="fas fa-arrow-left mr-1"></i> Back
                                    </a>
                                    <a href="{{ route('admin.organizers.edit', $organizer->id) }}" class="btn btn-primary flex-fill">
                                        <i class="fas fa-edit mr-1"></i> Edit
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Bookings, billing and payments --}}
                <div class="col-lg-8">
                    <h5 class="mb-3"><i class="fas fa-calendar-check mr-2"></i>Bookings ({{ $organizer->bookings->count() }})</h5>

                    @forelse($organizer->bookings as $booking)
                    @php
                        $billing = $booking->billing;
                        $activity = $booking->activity;
                        $package = $booking->package;
                        $inviteUrl = $booking->invitation_link ? url('/join/' . $booking->invitation_link) : null;
                        $bookingPayments = $payments->get($booking->id, collect());
                        $isIntra = $billing && $sellerState !== '' && strtolower(trim($billing->state)) === $sellerState;
                        $cgst = $billing ? round((float) $billing->gst_amount / 2, 2) : 0;
                    @endphp
                    <div class="card booking-card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <strong>Booking #{{ $booking->id }}</strong>
                                <span class="text-muted ml-1">· {{ $activity?->title ?? '—' }}</span>
                            </h3>
                            <div class="card-tools">
                                <span class="badge badge-{{ $statusColor($booking->status) }}">{{ $label($booking->status) }}</span>
                                @if($billing)
                                    <a href="{{ route('admin.organizers.invoice', ['organizer' => $organizer->id, 'booking' => $booking->id]) }}" class="btn btn-success btn-xs ml-2">
                                        <i class="fas fa-file-pdf"></i> Download Invoice PDF
                                    </a>
                                @endif
                            </div>
                        </div>
                        <div class="card-body">
                            {{-- Activity & schedule --}}
                            <div class="section-title">Activity &amp; Schedule</div>
                            <div class="row">
                                <div class="col-md-6">
                                    <dl class="row detail-list">
                                        <dt class="col-5">Activity</dt><dd class="col-7">{{ $activity?->title ?? '-' }}</dd>
                                        <dt class="col-5">Package</dt><dd class="col-7">{{ $package?->name ?? '-' }}</dd>
                                        @if($booking->game)
                                            <dt class="col-5">Game</dt><dd class="col-7">{{ $booking->game->title }}</dd>
                                        @endif
                                        <dt class="col-5">Booked On</dt><dd class="col-7">{{ optional($booking->created_at)->format('d M Y, h:i A') ?? '-' }}</dd>
                                    </dl>
                                </div>
                                <div class="col-md-6">
                                    <dl class="row detail-list">
                                        <dt class="col-5">Scheduled</dt>
                                        <dd class="col-7">
                                            {{ \Carbon\Carbon::parse($booking->scheduled_date)->format('d M Y') }},
                                            {{ \Carbon\Carbon::parse($booking->scheduled_time)->format('h:i A') }}
                                        </dd>
                                        <dt class="col-5">Rescheduled</dt><dd class="col-7">{{ $booking->is_rescheduled ? 'Yes' : 'No' }}</dd>
                                        <dt class="col-5">Link Clicks</dt><dd class="col-7">{{ (int) $booking->link_clicks }}</dd>
                                        <dt class="col-5">Games</dt>
                                        <dd class="col-7">
                                            @if($activity?->games?->count())
                                                {{ $activity->games->pluck('title')->implode(', ') }}
                                            @else
                                                -
                                            @endif
                                        </dd>
                                    </dl>
                                </div>
                            </div>

                            @if($inviteUrl)
                                <div class="input-group input-group-sm mt-2">
                                    <div class="input-group-prepend"><span class="input-group-text"><i class="fas fa-link mr-1"></i> Invite link</span></div>
                                    <input type="text" class="form-control invite-link-input" value="{{ $inviteUrl }}" readonly>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-primary btn-copy-invite" type="button" data-invite="{{ $inviteUrl }}">
                                            <i class="fas fa-copy"></i> Copy
                                        </button>
                                    </div>
                                </div>
                            @endif

                            <hr>

                            @if($billing)
                                <div class="row">
                                    {{-- Billing details entered at registration --}}
                                    <div class="col-md-6">
                                        <div class="section-title">Billing Details</div>
                                        <dl class="row detail-list">
                                            <dt class="col-5">GST Number</dt><dd class="col-7">{{ $billing->gst_number ?: '-' }}</dd>
                                            <dt class="col-5">Address</dt><dd class="col-7">{{ $billing->billing_address ?: '-' }}</dd>
                                            <dt class="col-5">City</dt><dd class="col-7">{{ $billing->city ?: '-' }}</dd>
                                            <dt class="col-5">State</dt><dd class="col-7">{{ $billing->state ?: '-' }}</dd>
                                            <dt class="col-5">PIN Code</dt><dd class="col-7">{{ $billing->pin_code ?: '-' }}</dd>
                                            <dt class="col-5">Tax Type</dt>
                                            <dd class="col-7">
                                                @if($sellerState === '')
                                                    <span class="text-muted">Set seller state in Settings &gt; Invoice</span>
                                                @else
                                                    {{ $isIntra ? 'CGST + SGST (same state)' : 'IGST (other state)' }}
                                                @endif
                                            </dd>
                                        </dl>
                                    </div>

                                    {{-- Amounts --}}
                                    <div class="col-md-6">
                                        <div class="section-title">Payment Summary</div>
                                        <table class="table table-sm amount-table mb-2">
                                            <tr><th>Package Price</th><td class="text-right">{{ $inr($billing->package_price) }}</td></tr>
                                            @if((float) $billing->additional_charges > 0)
                                                <tr><th>Additional Charges</th><td class="text-right">{{ $inr($billing->additional_charges) }}</td></tr>
                                            @endif
                                            @if($isIntra)
                                                <tr><th>CGST ({{ $rate($gstRate / 2) }}%)</th><td class="text-right">{{ $inr($cgst) }}</td></tr>
                                                <tr><th>SGST ({{ $rate($gstRate / 2) }}%)</th><td class="text-right">{{ $inr((float) $billing->gst_amount - $cgst) }}</td></tr>
                                            @else
                                                <tr><th>{{ $sellerState === '' ? 'GST' : 'IGST' }} ({{ $rate($gstRate) }}%)</th><td class="text-right">{{ $inr($billing->gst_amount) }}</td></tr>
                                            @endif
                                            <tr class="table-primary"><th><strong>Total Payable</strong></th><td class="text-right"><strong>{{ $inr($billing->total_payable) }}</strong></td></tr>
                                        </table>
                                        <dl class="row detail-list">
                                            <dt class="col-5">Method</dt><dd class="col-7">{{ strtoupper($billing->payment_method ?? '-') }}</dd>
                                            <dt class="col-5">Status</dt>
                                            <dd class="col-7"><span class="badge badge-{{ $statusColor($billing->payment_status) }}">{{ $label($billing->payment_status) }}</span></dd>
                                        </dl>
                                    </div>
                                </div>

                                {{-- Gateway transactions --}}
                                <div class="section-title mt-3">Transactions</div>
                                @if($bookingPayments->count())
                                    <div class="table-responsive">
                                        <table class="table table-sm table-bordered mb-0">
                                            <thead class="thead-light">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Gateway</th>
                                                    <th>Order / Payment ID</th>
                                                    <th class="text-right">Amount</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach($bookingPayments as $payment)
                                                    <tr>
                                                        <td>{{ $payment->id }}</td>
                                                        <td>{{ strtoupper($payment->gateway) }}</td>
                                                        <td class="small">
                                                            {{ $payment->gateway_order_id ?: '-' }}
                                                            @if($payment->gateway_payment_id)<br>{{ $payment->gateway_payment_id }}@endif
                                                            @if($payment->transaction_reference)<br>Ref: {{ $payment->transaction_reference }}@endif
                                                        </td>
                                                        <td class="text-right">{{ $inr($payment->amount) }}</td>
                                                        <td>
                                                            <span class="badge badge-{{ $statusColor($payment->payment_status) }}">{{ $label($payment->payment_status) }}</span>
                                                            @if($payment->refund_status && $payment->refund_status !== 'none')
                                                                <div class="small text-muted">Refund: {{ $label($payment->refund_status) }} ({{ $inr($payment->refunded_amount) }})</div>
                                                            @endif
                                                            @if($payment->failure_reason)
                                                                <div class="small text-danger">{{ $payment->failure_reason }}</div>
                                                            @endif
                                                        </td>
                                                        <td class="small">{{ optional($payment->paid_at ?? $payment->created_at)->format('d M Y, h:i A') }}</td>
                                                    </tr>
                                                @endforeach
                                            </tbody>
                                        </table>
                                    </div>
                                @else
                                    <p class="text-muted mb-0">No payment transactions recorded.</p>
                                @endif

                                {{-- Declarations ticked at checkout --}}
                                @php $details = $billing->confirmation_details ?? []; @endphp
                                @if(is_array($details) && count($details))
                                    <div class="section-title mt-3">Confirmations Accepted</div>
                                    <ul class="list-unstyled confirm-list row mb-0">
                                        @foreach($details as $key => $value)
                                            <li class="col-md-6">
                                                @if($value === true || $value === 1 || $value === '1' || $value === 'true')
                                                    <i class="fas fa-check-circle text-success mr-1"></i>
                                                @elseif($value === false || $value === 0 || $value === '0' || $value === 'false')
                                                    <i class="fas fa-times-circle text-danger mr-1"></i>
                                                @else
                                                    <i class="fas fa-info-circle text-info mr-1"></i>
                                                @endif
                                                {{ is_string($key) ? $label($key) : (is_scalar($value) ? $value : json_encode($value)) }}
                                                @if(is_string($key) && is_scalar($value) && !is_bool($value) && !in_array($value, [0, 1, '0', '1', 'true', 'false'], true))
                                                    : {{ $value }}
                                                @endif
                                            </li>
                                        @endforeach
                                    </ul>
                                @endif
                            @else
                                <p class="text-muted mb-0">No billing or payment information for this booking.</p>
                            @endif
                        </div>
                    </div>
                    @empty
                        <div class="card">
                            <div class="card-body text-muted">
                                No bookings found for this organizer.
                            </div>
                        </div>
                    @endforelse
                </div>
            </div>
        </div>
    </section>
</div>
@endsection

@section('footer_js')
<script>
$(function () {
    $(document).on('click', '.btn-copy-invite', async function () {
        const invite = $(this).data('invite');
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(invite);
            } else {
                const $input = $(this).closest('.input-group').find('.invite-link-input');
                $input.trigger('select');
                document.execCommand('copy');
            }
            toastr.success('Invitation link copied to clipboard!');
        } catch (e) {
            toastr.error('Failed to copy. Please copy manually.');
        }
    });
});
</script>
@endsection
