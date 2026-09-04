@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1>Payment Reports</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.payments.dashboard') }}">Payments</a></li>
                        <li class="breadcrumb-item active">Reports</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            @include('admin.alert_message')

            <div class="card card-outline card-primary">
                <div class="card-header"><h3 class="card-title">Report Range</h3></div>
                <form method="GET" action="{{ route('admin.payments.reports') }}">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3 form-group">
                                <label>From</label>
                                <input type="date" name="from" class="form-control form-control-sm" value="{{ $from->format('Y-m-d') }}">
                            </div>
                            <div class="col-md-3 form-group">
                                <label>To</label>
                                <input type="date" name="to" class="form-control form-control-sm" value="{{ $to->format('Y-m-d') }}">
                            </div>
                            <div class="col-md-3 form-group">
                                <label>Group By</label>
                                <select name="group_by" class="form-control form-control-sm">
                                    @foreach(['day' => 'Day', 'month' => 'Month', 'gateway' => 'Gateway', 'status' => 'Payment Status'] as $value => $label)
                                        <option value="{{ $value }}" @selected($group_by === $value)>{{ $label }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-3 form-group d-flex align-items-end">
                                <button type="submit" class="btn btn-primary btn-sm mr-2">
                                    <i class="fas fa-chart-bar"></i> Generate
                                </button>
                                <a href="{{ route('admin.payments.reports.export', ['from' => $from->format('Y-m-d'), 'to' => $to->format('Y-m-d'), 'group_by' => $group_by]) }}"
                                   class="btn btn-success btn-sm">
                                    <i class="fas fa-file-csv"></i> Export
                                </a>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {{-- Summary --}}
            <div class="row">
                <div class="col-md-3 col-6">
                    <div class="small-box bg-success">
                        <div class="inner">
                            <h3 style="font-size:1.6rem;">{{ money_inr($summary->revenue) }}</h3>
                            <p>Revenue (captured)</p>
                        </div>
                        <div class="icon"><i class="fas fa-rupee-sign"></i></div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="small-box bg-info">
                        <div class="inner">
                            <h3 style="font-size:1.6rem;">{{ money_inr($summary->razorpay_revenue) }}</h3>
                            <p>Razorpay Revenue</p>
                        </div>
                        <div class="icon"><i class="fas fa-credit-card"></i></div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="small-box bg-warning">
                        <div class="inner">
                            <h3 style="font-size:1.6rem;">{{ money_inr($summary->cod_revenue) }}</h3>
                            <p>COD Revenue</p>
                        </div>
                        <div class="icon"><i class="fas fa-money-bill-wave"></i></div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="small-box bg-dark">
                        <div class="inner">
                            <h3 style="font-size:1.6rem;">{{ money_inr($summary->refunded) }}</h3>
                            <p>Refunded</p>
                        </div>
                        <div class="icon"><i class="fas fa-undo"></i></div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-3 col-6">
                    <div class="info-box">
                        <span class="info-box-icon bg-secondary"><i class="fas fa-list"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Attempts</span>
                            <span class="info-box-number">{{ number_format($summary->attempts) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="info-box">
                        <span class="info-box-icon bg-success"><i class="fas fa-check"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Successful</span>
                            <span class="info-box-number">{{ number_format($summary->successful ?? 0) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="info-box">
                        <span class="info-box-icon bg-warning"><i class="fas fa-clock"></i></span>
                        <div class="info-box-content">
                            <span class="info-box-text">Pending</span>
                            <span class="info-box-number">{{ number_format($summary->pending ?? 0) }}</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="info-box">
                        <span class="info-box-icon bg-primary"><i class="fas fa-percentage"></i></span>
                        <div class="info-box-content">
                            {{-- Measured against terminal attempts only: an
                                 unpaid COD order is neither a success nor a
                                 failure yet. --}}
                            <span class="info-box-text">Success Rate</span>
                            <span class="info-box-number">
                                {{ $success_rate === null ? '—' : $success_rate . '%' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        Breakdown by {{ ucfirst($group_by) }}
                        <small class="text-muted">({{ $from->format('d M Y') }} – {{ $to->format('d M Y') }})</small>
                    </h3>
                </div>
                <div class="card-body table-responsive p-0">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>{{ ucfirst($group_by) }}</th>
                                <th class="text-right">Payments</th>
                                <th class="text-right">Successful</th>
                                <th class="text-right">Failed</th>
                                <th class="text-right">Razorpay</th>
                                <th class="text-right">COD</th>
                                <th class="text-right">Refunded</th>
                                <th class="text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($rows as $row)
                                <tr>
                                    <td>
                                        @if(in_array($group_by, ['gateway', 'status'], true))
                                            <span class="badge badge-light">{{ strtoupper($row->bucket) }}</span>
                                        @else
                                            {{ $row->bucket }}
                                        @endif
                                    </td>
                                    <td class="text-right">{{ number_format($row->payments) }}</td>
                                    <td class="text-right text-success">{{ number_format($row->successful ?? 0) }}</td>
                                    <td class="text-right text-danger">{{ number_format($row->failed ?? 0) }}</td>
                                    <td class="text-right">{{ money_inr($row->razorpay_revenue) }}</td>
                                    <td class="text-right">{{ money_inr($row->cod_revenue) }}</td>
                                    <td class="text-right">{{ money_inr($row->refunded) }}</td>
                                    <td class="text-right"><strong>{{ money_inr($row->revenue) }}</strong></td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="8" class="text-center text-muted py-4">
                                        No payments in this period.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                        @if($rows->isNotEmpty())
                            <tfoot>
                                <tr class="bg-light font-weight-bold">
                                    <td>Total</td>
                                    <td class="text-right">{{ number_format($rows->sum('payments')) }}</td>
                                    <td class="text-right">{{ number_format($rows->sum('successful')) }}</td>
                                    <td class="text-right">{{ number_format($rows->sum('failed')) }}</td>
                                    <td class="text-right">{{ money_inr($rows->sum('razorpay_revenue')) }}</td>
                                    <td class="text-right">{{ money_inr($rows->sum('cod_revenue')) }}</td>
                                    <td class="text-right">{{ money_inr($rows->sum('refunded')) }}</td>
                                    <td class="text-right">{{ money_inr($rows->sum('revenue')) }}</td>
                                </tr>
                            </tfoot>
                        @endif
                    </table>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
