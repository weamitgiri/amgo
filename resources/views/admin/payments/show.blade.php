@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1>Payment #{{ $payment->id }}</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.payments.index') }}">Payments</a></li>
                        <li class="breadcrumb-item active">#{{ $payment->id }}</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            @include('admin.alert_message')

            <div class="row">
                <div class="col-md-8">
                    {{-- Payment --}}
                    <div class="card card-outline card-primary">
                        <div class="card-header">
                            <h3 class="card-title">Payment Details</h3>
                            <div class="card-tools">
                                <span class="badge badge-{{ $payment->statusBadgeClass() }}">
                                    {{ ucfirst($payment->payment_status) }}
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <dl class="row mb-0">
                                <dt class="col-sm-4">Order (Booking) ID</dt>
                                <dd class="col-sm-8">#{{ $payment->booking_id }}</dd>

                                <dt class="col-sm-4">Amount</dt>
                                <dd class="col-sm-8"><strong>{{ money_inr($payment->amount) }}</strong></dd>

                                <dt class="col-sm-4">Currency</dt>
                                <dd class="col-sm-8">{{ $payment->currency }}</dd>

                                <dt class="col-sm-4">Payment Method</dt>
                                <dd class="col-sm-8">
                                    <span class="badge badge-{{ $payment->isRazorpay() ? 'info' : 'warning' }}">
                                        {{ $payment->isRazorpay() ? 'Razorpay' : 'Cash on Delivery' }}
                                    </span>
                                </dd>

                                <dt class="col-sm-4">Gateway</dt>
                                <dd class="col-sm-8">{{ strtoupper($payment->gateway) }}</dd>

                                {{-- Razorpay-specific identifiers. Shown as N/A rather
                                     than hidden for COD, so a blank is never ambiguous. --}}
                                <dt class="col-sm-4">Razorpay Order ID</dt>
                                <dd class="col-sm-8">
                                    @if($payment->isRazorpay())
                                        <code>{{ $payment->gateway_order_id ?? '—' }}</code>
                                    @else
                                        <span class="text-muted">N/A</span>
                                    @endif
                                </dd>

                                <dt class="col-sm-4">Razorpay Payment ID</dt>
                                <dd class="col-sm-8">
                                    @if($payment->isRazorpay())
                                        <code>{{ $payment->gateway_payment_id ?? '—' }}</code>
                                    @else
                                        <span class="text-muted">N/A</span>
                                    @endif
                                </dd>

                                <dt class="col-sm-4">Transaction Reference</dt>
                                <dd class="col-sm-8">
                                    <code>{{ $payment->transaction_reference ?? ($payment->isRazorpay() ? '—' : 'N/A') }}</code>
                                </dd>

                                <dt class="col-sm-4">Payment Status</dt>
                                <dd class="col-sm-8">
                                    <span class="badge badge-{{ $payment->statusBadgeClass() }}">
                                        {{ ucfirst($payment->payment_status) }}
                                    </span>
                                </dd>

                                <dt class="col-sm-4">Order Status</dt>
                                <dd class="col-sm-8">
                                    {{ str_replace('_', ' ', ucfirst($payment->booking->status ?? '—')) }}
                                </dd>

                                @if($payment->refunded_amount > 0)
                                    <dt class="col-sm-4">Refund</dt>
                                    <dd class="col-sm-8">
                                        {{ money_inr($payment->refunded_amount) }}
                                        <span class="badge badge-secondary">{{ ucfirst($payment->refund_status) }}</span>
                                    </dd>
                                @endif

                                <dt class="col-sm-4">Created At</dt>
                                <dd class="col-sm-8">{{ $payment->created_at?->format('d M Y, H:i:s') }}</dd>

                                <dt class="col-sm-4">Paid At</dt>
                                <dd class="col-sm-8">{{ $payment->paid_at?->format('d M Y, H:i:s') ?? '—' }}</dd>

                                @if($payment->failure_reason)
                                    <dt class="col-sm-4">Failure Reason</dt>
                                    <dd class="col-sm-8"><span class="text-danger">{{ $payment->failure_reason }}</span></dd>
                                @endif
                            </dl>
                        </div>

                        @if($payment->isCod() && in_array($payment->payment_status, ['pending', 'authorized'], true))
                            <div class="card-footer">
                                {{-- Manual settlement exists for COD only. A Razorpay
                                     payment's status belongs to the gateway. --}}
                                <form method="POST" action="{{ route('admin.payments.markAsPaid', $payment->id) }}"
                                      onsubmit="return confirm('Mark this COD payment as paid? This records the money as collected.');">
                                    @csrf
                                    <button type="submit" class="btn btn-success btn-sm">
                                        <i class="fas fa-check"></i> Mark COD Payment as Paid
                                    </button>
                                </form>
                            </div>
                        @endif
                    </div>

                    {{-- Metadata --}}
                    @if(!empty($payment->metadata))
                        <div class="card card-outline card-secondary">
                            <div class="card-header"><h3 class="card-title">Metadata</h3></div>
                            <div class="card-body table-responsive p-0">
                                <table class="table table-sm">
                                    <tbody>
                                        @foreach($payment->metadata as $key => $value)
                                            <tr>
                                                <th style="width:35%;">{{ ucwords(str_replace('_', ' ', $key)) }}</th>
                                                <td>
                                                    @if(is_array($value) || is_object($value))
                                                        <code>{{ json_encode($value) }}</code>
                                                    @elseif(is_bool($value))
                                                        {{ $value ? 'Yes' : 'No' }}
                                                    @else
                                                        {{ $value === null || $value === '' ? '—' : $value }}
                                                    @endif
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    @endif

                    {{-- Webhook trail --}}
                    <div class="card card-outline card-secondary">
                        <div class="card-header"><h3 class="card-title">Gateway Webhook Events</h3></div>
                        <div class="card-body table-responsive p-0">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Event</th>
                                        <th>Status</th>
                                        <th>Received</th>
                                        <th>Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($webhook_events as $event)
                                        <tr>
                                            <td><code>{{ $event->event_type }}</code></td>
                                            <td>
                                                <span class="badge badge-{{ $event->status === 'processed' ? 'success' : ($event->status === 'failed' ? 'danger' : 'secondary') }}">
                                                    {{ ucfirst($event->status) }}
                                                </span>
                                            </td>
                                            <td><small>{{ \Illuminate\Support\Carbon::parse($event->created_at)->format('d M Y, H:i:s') }}</small></td>
                                            <td><small class="text-danger">{{ $event->error ?? '' }}</small></td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="4" class="text-center text-muted py-3">
                                                No webhook events recorded for this payment.
                                            </td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    {{-- Customer --}}
                    <div class="card card-outline card-info">
                        <div class="card-header"><h3 class="card-title">Customer</h3></div>
                        <div class="card-body">
                            <dl class="mb-0">
                                <dt>Name</dt>
                                <dd>{{ $payment->organizer->name ?? '—' }}</dd>
                                <dt>Email</dt>
                                <dd>{{ $payment->organizer->email ?? '—' }}</dd>
                                <dt>Company</dt>
                                <dd>{{ $payment->organizer->company_name ?? '—' }}</dd>
                                <dt>Phone</dt>
                                {{-- organizers has no phone column; the billing record is
                                     the only place a contact number could appear. --}}
                                <dd>{{ $payment->organizer->phone ?? '—' }}</dd>
                            </dl>
                            @if($payment->organizer)
                                <a href="{{ route('admin.organizers.show', $payment->organizer->id) }}" class="btn btn-sm btn-default btn-block">
                                    View Organizer
                                </a>
                            @endif
                        </div>
                    </div>

                    {{-- Booking --}}
                    <div class="card card-outline card-info">
                        <div class="card-header"><h3 class="card-title">Booking</h3></div>
                        <div class="card-body">
                            <dl class="mb-0">
                                <dt>Activity</dt>
                                <dd>{{ $payment->booking->activity->title ?? '—' }}</dd>
                                <dt>Game</dt>
                                <dd>{{ $payment->booking->game->title ?? '—' }}</dd>
                                <dt>Package</dt>
                                <dd>{{ $payment->booking->package->name ?? '—' }}</dd>
                                <dt>Scheduled</dt>
                                <dd>
                                    @if($payment->booking)
                                        {{ $payment->booking->scheduled_date }} at {{ $payment->booking->scheduled_time }}
                                    @else — @endif
                                </dd>
                            </dl>
                        </div>
                    </div>

                    {{-- Billing / GST --}}
                    @if($payment->billing)
                        <div class="card card-outline card-secondary">
                            <div class="card-header"><h3 class="card-title">Billing (GST)</h3></div>
                            <div class="card-body">
                                <dl class="mb-0">
                                    <dt>GST Number</dt>
                                    <dd>{{ $payment->billing->gst_number ?? '—' }}</dd>
                                    <dt>Address</dt>
                                    <dd>
                                        {{ $payment->billing->billing_address }}<br>
                                        {{ $payment->billing->city }}, {{ $payment->billing->state }} — {{ $payment->billing->pin_code }}
                                    </dd>
                                    <dt>Package Price</dt>
                                    <dd>{{ money_inr($payment->billing->package_price) }}</dd>
                                    <dt>GST Amount</dt>
                                    <dd>{{ money_inr($payment->billing->gst_amount) }}</dd>
                                    <dt>Total Payable</dt>
                                    <dd><strong>{{ money_inr($payment->billing->total_payable) }}</strong></dd>
                                    <dt>Billing Status</dt>
                                    <dd>{{ ucfirst($payment->billing->payment_status) }}</dd>
                                </dl>
                            </div>
                        </div>
                    @endif
                </div>
            </div>

            <a href="{{ url()->previous() }}" class="btn btn-default">
                <i class="fas fa-arrow-left"></i> Back
            </a>
        </div>
    </section>
</div>
@endsection
