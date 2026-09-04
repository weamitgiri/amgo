@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1>Payment Dashboard</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item active">Payments</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            @include('admin.alert_message')

            {{-- Today --}}
            <div class="row">
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-success">
                        <div class="inner">
                            <h3 style="font-size:1.8rem;">{{ money_inr($today_stats->revenue) }}</h3>
                            <p>Today's Revenue</p>
                        </div>
                        <div class="icon"><i class="fas fa-rupee-sign"></i></div>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-info">
                        <div class="inner">
                            <h3 style="font-size:1.8rem;">{{ money_inr($today_stats->razorpay_revenue) }}</h3>
                            <p>Razorpay (Today)</p>
                        </div>
                        <div class="icon"><i class="fas fa-credit-card"></i></div>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-warning">
                        <div class="inner">
                            <h3 style="font-size:1.8rem;">{{ money_inr($today_stats->cod_revenue) }}</h3>
                            <p>COD Collected (Today)</p>
                        </div>
                        <div class="icon"><i class="fas fa-money-bill-wave"></i></div>
                    </div>
                </div>
                <div class="col-lg-3 col-6">
                    <div class="small-box bg-primary">
                        <div class="inner">
                            <h3 style="font-size:1.8rem;">{{ money_inr($month_revenue) }}</h3>
                            <p>This Month</p>
                        </div>
                        <div class="icon"><i class="fas fa-calendar-alt"></i></div>
                    </div>
                </div>
            </div>

            {{-- Counters --}}
            <div class="row">
                <div class="col-md-2 col-sm-4 col-6">
                    <div class="info-box">
                        <span class="info-box-icon bg-secondary"><i class="fas fa-list"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Total Payments</span>
                            <span class="info-box-number">{{ number_format($totals->total_payments) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 col-sm-4 col-6">
                    <div class="info-box">
                        <span class="info-box-icon bg-success"><i class="fas fa-check"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Successful</span>
                            <span class="info-box-number">{{ number_format($totals->successful_payments ?? 0) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 col-sm-4 col-6">
                    <div class="info-box">
                        <span class="info-box-icon bg-warning"><i class="fas fa-clock"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Pending</span>
                            <span class="info-box-number">{{ number_format($totals->pending_payments ?? 0) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 col-sm-4 col-6">
                    <div class="info-box">
                        <span class="info-box-icon bg-danger"><i class="fas fa-times"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Failed</span>
                            <span class="info-box-number">{{ number_format($totals->failed_payments ?? 0) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 col-sm-4 col-6">
                    <div class="info-box">
                        <span class="info-box-icon bg-info"><i class="fas fa-truck"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">COD Orders</span>
                            <span class="info-box-number">{{ number_format($totals->cod_orders ?? 0) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 col-sm-4 col-6">
                    <div class="info-box">
                        <span class="info-box-icon bg-dark"><i class="fas fa-undo"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Refunded</span>
                            <span class="info-box-number">{{ money_inr($totals->refunded_amount) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Revenue split --}}
            <div class="row">
                <div class="col-md-4">
                    <div class="card card-outline card-success">
                        <div class="card-body text-center">
                            <p class="text-muted mb-1">Razorpay Revenue</p>
                            <h4 class="mb-0">{{ money_inr($totals->razorpay_revenue) }}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card card-outline card-warning">
                        <div class="card-body text-center">
                            <p class="text-muted mb-1">COD Revenue (collected)</p>
                            <h4 class="mb-0">{{ money_inr($totals->cod_revenue) }}</h4>
                            {{-- Money still owed on COD orders — expectation, not revenue. --}}
                            <small class="text-muted">{{ money_inr($totals->cod_outstanding) }} outstanding</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card card-outline card-primary">
                        <div class="card-body text-center">
                            <p class="text-muted mb-1">Total Revenue</p>
                            <h4 class="mb-0">{{ money_inr($totals->total_revenue) }}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Trend --}}
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Revenue — Last 14 Days</h3>
                </div>
                <div class="card-body">
                    <canvas id="revenueTrend" style="height:220px;"></canvas>
                </div>
            </div>

            {{-- Recent --}}
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Recent Payments</h3>
                    <div class="card-tools">
                        <a href="{{ route('admin.payments.index') }}" class="btn btn-sm btn-primary">View All</a>
                    </div>
                </div>
                <div class="card-body table-responsive p-0">
                    <table class="table table-hover text-nowrap">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recent_payments as $payment)
                                <tr>
                                    <td>{{ $payment->id }}</td>
                                    <td>#{{ $payment->booking_id }}</td>
                                    <td>{{ $payment->organizer->name ?? '—' }}</td>
                                    <td>{{ money_inr($payment->amount) }}</td>
                                    <td><span class="badge badge-light">{{ strtoupper($payment->payment_method) }}</span></td>
                                    <td>
                                        <span class="badge badge-{{ $payment->statusBadgeClass() }}">
                                            {{ ucfirst($payment->payment_status) }}
                                        </span>
                                    </td>
                                    <td>{{ $payment->created_at?->format('d M Y, H:i') }}</td>
                                    <td>
                                        <a href="{{ route('admin.payments.show', $payment->id) }}" class="btn btn-xs btn-info">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="8" class="text-center text-muted py-4">No payments recorded yet.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection

@section('footer_js')
<script src="{{ asset('admin/plugins/chart.js/Chart.min.js') }}"></script>
<script type="text/javascript" nonce="{{ csrf_token() }}">
  (function () {
    var canvas = document.getElementById('revenueTrend');
    // AdminLTE ships Chart.js, but skip silently rather than throwing if the
    // asset is absent — the numbers above are the real content of this page.
    if (!canvas || typeof Chart === 'undefined') return;

    var series = @json($trend_series);

    new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: series.map(function (d) { return d.label; }),
        datasets: [{
          label: 'Revenue (₹)',
          data: series.map(function (d) { return d.revenue; }),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0,123,255,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
      }
    });
  })();
</script>
@endsection
