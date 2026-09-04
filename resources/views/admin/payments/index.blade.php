@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1>{{ $scopeTitle }}</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.payments.dashboard') }}">Payments</a></li>
                        <li class="breadcrumb-item active">{{ $scopeTitle }}</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            @include('admin.alert_message')

            {{-- Filters. A plain GET form: every filter ends up in the URL, so a
                 filtered view is shareable, bookmarkable and survives a reload,
                 and Export CSV can reuse the exact same query string. --}}
            <div class="card card-outline card-primary">
                <div class="card-header">
                    <h3 class="card-title">Filters</h3>
                    <div class="card-tools">
                        <button type="button" class="btn btn-tool" data-card-widget="collapse">
                            <i class="fas fa-minus"></i>
                        </button>
                    </div>
                </div>
                <form method="GET" action="{{ route('admin.payments.index') }}" id="paymentFilterForm">
                    <input type="hidden" name="scope" value="{{ $scope }}">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3 form-group">
                                <label>Date From</label>
                                <input type="date" name="date_from" class="form-control form-control-sm" value="{{ $filters['date_from'] ?? '' }}">
                            </div>
                            <div class="col-md-3 form-group">
                                <label>Date To</label>
                                <input type="date" name="date_to" class="form-control form-control-sm" value="{{ $filters['date_to'] ?? '' }}">
                            </div>
                            <div class="col-md-3 form-group">
                                <label>Payment Method</label>
                                <select name="payment_method" class="form-control form-control-sm">
                                    <option value="">All</option>
                                    <option value="razorpay" @selected(($filters['payment_method'] ?? '') === 'razorpay')>Razorpay</option>
                                    <option value="cod" @selected(($filters['payment_method'] ?? '') === 'cod')>Cash on Delivery</option>
                                </select>
                            </div>
                            <div class="col-md-3 form-group">
                                <label>Gateway</label>
                                <select name="gateway" class="form-control form-control-sm">
                                    <option value="">All</option>
                                    <option value="razorpay" @selected(($filters['gateway'] ?? '') === 'razorpay')>Razorpay</option>
                                    <option value="cod" @selected(($filters['gateway'] ?? '') === 'cod')>COD</option>
                                </select>
                            </div>

                            <div class="col-md-3 form-group">
                                <label>Payment Status</label>
                                <select name="payment_status" class="form-control form-control-sm">
                                    <option value="">All</option>
                                    @foreach(\App\Models\Payment::STATUSES as $status)
                                        <option value="{{ $status }}" @selected(($filters['payment_status'] ?? '') === $status)>
                                            {{ ucfirst($status) }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-3 form-group">
                                <label>Order Status</label>
                                <select name="order_status" class="form-control form-control-sm">
                                    <option value="">All</option>
                                    @foreach(['pending_activation' => 'Pending Activation', 'active' => 'Active', 'completed' => 'Completed', 'expired' => 'Expired'] as $value => $label)
                                        <option value="{{ $value }}" @selected(($filters['order_status'] ?? '') === $value)>{{ $label }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-3 form-group">
                                <label>Customer</label>
                                <input type="text" name="customer" class="form-control form-control-sm" placeholder="Name, email or company" value="{{ $filters['customer'] ?? '' }}">
                            </div>
                            <div class="col-md-3 form-group">
                                <label>Order ID</label>
                                <input type="number" name="order_id" class="form-control form-control-sm" placeholder="Booking ID" value="{{ $filters['order_id'] ?? '' }}">
                            </div>

                            <div class="col-md-3 form-group">
                                <label>Transaction ID</label>
                                <input type="text" name="transaction_id" class="form-control form-control-sm" placeholder="pay_xxx / order_xxx" value="{{ $filters['transaction_id'] ?? '' }}">
                            </div>
                            <div class="col-md-2 form-group">
                                <label>Min Amount</label>
                                <input type="number" step="0.01" name="amount_min" class="form-control form-control-sm" value="{{ $filters['amount_min'] ?? '' }}">
                            </div>
                            <div class="col-md-2 form-group">
                                <label>Max Amount</label>
                                <input type="number" step="0.01" name="amount_max" class="form-control form-control-sm" value="{{ $filters['amount_max'] ?? '' }}">
                            </div>
                            <div class="col-md-5 form-group">
                                <label>Search</label>
                                <input type="text" name="search" class="form-control form-control-sm" placeholder="Any ID, customer or reference" value="{{ $filters['search'] ?? '' }}">
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="submit" class="btn btn-primary btn-sm">
                            <i class="fas fa-filter"></i> Apply Filters
                        </button>
                        <a href="{{ route('admin.payments.index', ['scope' => $scope]) }}" class="btn btn-default btn-sm">
                            <i class="fas fa-undo"></i> Reset Filters
                        </a>
                        {{-- Carries the current filters through so the export
                             matches exactly what is on screen. --}}
                        <a href="{{ route('admin.payments.export', array_merge($filters, ['scope' => $scope])) }}" class="btn btn-success btn-sm float-right">
                            <i class="fas fa-file-csv"></i> Export CSV
                        </a>
                    </div>
                </form>
            </div>

            {{-- Totals for the filtered set, not the visible page. --}}
            <div class="row">
                <div class="col-md-4">
                    <div class="info-box">
                        <span class="info-box-icon bg-secondary"><i class="fas fa-hashtag"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Matching Payments</span>
                            <span class="info-box-number">{{ number_format($summary->count) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="info-box">
                        <span class="info-box-icon bg-info"><i class="fas fa-receipt"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Total Value</span>
                            <span class="info-box-number">{{ money_inr($summary->amount) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="info-box">
                        <span class="info-box-icon bg-success"><i class="fas fa-check-circle"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Settled Value</span>
                            <span class="info-box-number">{{ money_inr($summary->settled_amount) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">{{ $scopeTitle }}</h3>
                    <div class="card-tools">
                        <a href="{{ route('admin.payments.index') }}" class="btn btn-xs {{ $scope === 'all' ? 'btn-primary' : 'btn-default' }}">All</a>
                        <a href="{{ route('admin.payments.index', ['scope' => 'razorpay']) }}" class="btn btn-xs {{ $scope === 'razorpay' ? 'btn-primary' : 'btn-default' }}">Razorpay</a>
                        <a href="{{ route('admin.payments.index', ['scope' => 'cod']) }}" class="btn btn-xs {{ $scope === 'cod' ? 'btn-primary' : 'btn-default' }}">COD</a>
                        <a href="{{ route('admin.payments.index', ['scope' => 'failed']) }}" class="btn btn-xs {{ $scope === 'failed' ? 'btn-primary' : 'btn-default' }}">Failed</a>
                        <a href="{{ route('admin.payments.index', ['scope' => 'refunded']) }}" class="btn btn-xs {{ $scope === 'refunded' ? 'btn-primary' : 'btn-default' }}">Refunded</a>
                    </div>
                </div>

                <div class="card-body table-responsive p-0">
                    <table class="table table-hover table-striped text-nowrap">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Gateway</th>
                                <th>Transaction ID</th>
                                <th>Razorpay Order ID</th>
                                <th>Payment Status</th>
                                <th>Order Status</th>
                                <th>Paid At</th>
                                <th>Created At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($payments as $payment)
                                <tr>
                                    <td>{{ $payment->id }}</td>
                                    <td>
                                        <a href="{{ route('admin.payments.show', $payment->id) }}">#{{ $payment->booking_id }}</a>
                                        @if($payment->booking?->activity)
                                            <br><small class="text-muted">{{ $payment->booking->activity->title }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        {{ $payment->organizer->name ?? '—' }}
                                        @if($payment->organizer?->email)
                                            <br><small class="text-muted">{{ $payment->organizer->email }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <strong>{{ money_inr($payment->amount) }}</strong>
                                        @if($payment->refunded_amount > 0)
                                            <br><small class="text-danger">-{{ money_inr($payment->refunded_amount) }} refunded</small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge badge-{{ $payment->isRazorpay() ? 'info' : 'warning' }}">
                                            {{ $payment->isRazorpay() ? 'Razorpay' : 'COD' }}
                                        </span>
                                    </td>
                                    <td>{{ strtoupper($payment->gateway) }}</td>
                                    {{-- COD has no gateway identifiers; an em dash is the honest value. --}}
                                    <td><code>{{ $payment->gateway_payment_id ?? '—' }}</code></td>
                                    <td><code>{{ $payment->gateway_order_id ?? '—' }}</code></td>
                                    <td>
                                        <span class="badge badge-{{ $payment->statusBadgeClass() }}">
                                            {{ ucfirst($payment->payment_status) }}
                                        </span>
                                    </td>
                                    <td>
                                        <small>{{ str_replace('_', ' ', ucfirst($payment->booking->status ?? '—')) }}</small>
                                    </td>
                                    <td><small>{{ $payment->paid_at?->format('d M Y, H:i') ?? '—' }}</small></td>
                                    <td><small>{{ $payment->created_at?->format('d M Y, H:i') }}</small></td>
                                    <td>
                                        <a href="{{ route('admin.payments.show', $payment->id) }}" class="btn btn-xs btn-info" title="View">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="13" class="text-center text-muted py-4">
                                        No payments match these filters.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <div class="card-footer clearfix">
                    <div class="float-left text-muted">
                        Showing {{ $payments->firstItem() ?? 0 }}–{{ $payments->lastItem() ?? 0 }}
                        of {{ number_format($payments->total()) }}
                    </div>
                    <div class="float-right">
                        {{-- Explicit Bootstrap 4 links: Laravel 11 defaults to
                             the Tailwind paginator, which renders unstyled
                             inside this AdminLTE panel. Set here rather than
                             globally so no other view changes. --}}
                        {{ $payments->links('pagination::bootstrap-4') }}
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
