@extends('admin.layouts.default')

@section('header_css')
<style>
    .organizers-table td, .organizers-table th { vertical-align: middle; }
    .organizers-table .org-name { font-weight: 600; }
    .organizers-table .org-sub { font-size: .8rem; color: #6c757d; word-break: break-all; }
    .organizers-table .actions { white-space: nowrap; }
    .organizers-table .actions .btn, .organizers-table .actions form { margin-bottom: 2px; }
</style>
@endsection

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Organizer Manager</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item active">Organizers</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            @include('admin.alert_message')
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title mt-1">Organizer List</h3>
                    <div class="card-tools d-flex align-items-center">
                        <form method="GET" action="{{ route('admin.organizers.index') }}" class="mr-2">
                            <div class="input-group input-group-sm" style="width: 260px;">
                                <input type="text" name="search" class="form-control" placeholder="Name, email, company or phone" value="{{ $search }}">
                                <div class="input-group-append">
                                    <button type="submit" class="btn btn-default"><i class="fas fa-search"></i></button>
                                    @if($search !== '')
                                        <a href="{{ route('admin.organizers.index') }}" class="btn btn-default" title="Clear search"><i class="fas fa-times"></i></a>
                                    @endif
                                </div>
                            </div>
                        </form>
                        <a href="{{ route('admin.organizers.create') }}" class="btn btn-primary btn-sm">
                            <i class="fas fa-plus"></i> Add New Organizer
                        </a>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover table-striped mb-0 organizers-table">
                            <thead class="thead-light">
                                <tr>
                                    <th style="width: 60px;">ID</th>
                                    <th>Organizer</th>
                                    <th>Company</th>
                                    <th>Activity / Package</th>
                                    <th>Scheduled</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th class="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($organizers as $organizer)
                                @php
                                    $booking = $organizer->bookings->first();
                                    $billing = $organizer->bookings->first(fn ($b) => $b->billing)?->billing;
                                @endphp
                                <tr>
                                    <td>#{{ $organizer->id }}</td>
                                    <td>
                                        <div class="org-name">{{ $organizer->name }}</div>
                                        <div class="org-sub">{{ $organizer->email }}</div>
                                        @if($organizer->phone)<div class="org-sub">{{ $organizer->phone }}</div>@endif
                                    </td>
                                    <td>{{ $organizer->company_name ?: '-' }}</td>
                                    <td>
                                        @if($booking)
                                            {{ $booking->activity?->title ?? '-' }}
                                            <div class="org-sub">{{ $booking->package?->name ?? '' }}</div>
                                        @else
                                            <span class="text-muted">No booking</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($booking)
                                            {{ \Carbon\Carbon::parse($booking->scheduled_date)->format('d M Y') }}
                                            <div class="org-sub">{{ \Carbon\Carbon::parse($booking->scheduled_time)->format('h:i A') }}</div>
                                        @else
                                            -
                                        @endif
                                    </td>
                                    <td>
                                        @if($billing)
                                            ₹{{ number_format((float) $billing->total_payable, 2) }}
                                            <div class="org-sub">{{ strtoupper($billing->payment_method ?? '') }} · {{ ucfirst($billing->payment_status) }}</div>
                                        @else
                                            -
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge badge-{{ $organizer->status === 'active' ? 'success' : 'secondary' }}">
                                            {{ ucfirst($organizer->status) }}
                                        </span>
                                    </td>
                                    <td class="actions text-right">
                                        <a href="{{ route('admin.organizers.show', $organizer->id) }}" class="btn btn-info btn-sm" title="View">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="{{ route('admin.organizers.edit', $organizer->id) }}" class="btn btn-primary btn-sm" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        @if($billing)
                                            <a href="{{ route('admin.organizers.invoice', $organizer->id) }}" class="btn btn-success btn-sm" title="Download Invoice PDF">
                                                <i class="fas fa-file-pdf"></i> Invoice
                                            </a>
                                        @else
                                            <button type="button" class="btn btn-outline-secondary btn-sm" disabled title="No billing details yet">
                                                <i class="fas fa-file-pdf"></i> Invoice
                                            </button>
                                        @endif
                                        <form action="{{ route('admin.organizers.destroy', $organizer->id) }}" method="POST" class="d-inline-block">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-sm" title="Delete" onclick="return confirm('Are you sure?')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="8" class="text-center text-muted py-4">
                                        {{ $search !== '' ? 'No organizers match your search.' : 'No organizers found.' }}
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card-footer clearfix">
                    <div class="float-left text-muted pt-1">
                        Showing {{ $organizers->firstItem() ?? 0 }}–{{ $organizers->lastItem() ?? 0 }}
                        of {{ number_format($organizers->total()) }}
                    </div>
                    <div class="float-right">
                        {{ $organizers->onEachSide(1)->links('pagination::bootstrap-4') }}
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
