@extends('admin.layouts.default')

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
                        <li class="breadcrumb-item active">Details</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            @include('admin.alert_message')
            <div class="row">
                <!-- Organizer Info -->
                <div class="col-md-4">
                    <div class="card card-primary card-outline">
                        <div class="card-body box-profile">
                            <div class="text-center">
                                <img class="profile-user-img img-fluid img-circle"
                                     src="https://ui-avatars.com/api/?name={{ urlencode($organizer->name) }}&background=0D8ABC&color=fff"
                                     alt="User profile picture">
                            </div>
                            <h3 class="profile-username text-center">{{ $organizer->name }}</h3>
                            <p class="text-muted text-center">{{ $organizer->company_name }}</p>

                            <ul class="list-group list-group-unbordered mb-3">
                                <li class="list-group-item">
                                    <b>Email</b> <a class="float-right">{{ $organizer->email }}</a>
                                </li>
                                <li class="list-group-item">
                                    <b>Website</b>
                                    <span class="float-right">
                                        @if($organizer->company_website)
                                            <a href="{{ $organizer->company_website }}" target="_blank" rel="noopener noreferrer">{{ $organizer->company_website }}</a>
                                        @else
                                            N/A
                                        @endif
                                    </span>
                                </li>
                                <li class="list-group-item">
                                    <b>Status</b> <span class="badge badge-{{ $organizer->status == 'active' ? 'success' : 'danger' }} float-right">{{ ucfirst($organizer->status) }}</span>
                                </li>
                                <li class="list-group-item">
                                    <b>Created</b> <span class="float-right text-muted">{{ optional($organizer->created_at)->format('Y-m-d H:i') }}</span>
                                </li>
                            </ul>
                            <div class="d-flex">
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

                <!-- Booking Info -->
                <div class="col-md-8">
                    @forelse($organizer->bookings as $booking)
                    @php
                        $billing = $booking->billing;
                        $activity = $booking->activity;
                        $package = $booking->package;
                        $inviteUrl = $booking->invitation_link ? url('/join/' . $booking->invitation_link) : null;
                    @endphp
                    <div class="card card-outline card-info">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-calendar-check mr-2"></i>
                                Booking: {{ $activity?->title ?? '—' }}
                            </h3>
                            <div class="card-tools">
                                <span class="badge badge-info">{{ ucfirst(str_replace('_', ' ', $booking->status)) }}</span>
                            </div>
                        </div>
                        <div class="card-body">
                            @if($inviteUrl)
                                <div class="alert alert-light border mb-4">
                                    <h6 class="mb-2"><i class="fas fa-link mr-2"></i>Invitation Link for Participants</h6>
                                    <div class="input-group">
                                        <input type="text" class="form-control invite-link-input" value="{{ $inviteUrl }}" readonly>
                                        <div class="input-group-append">
                                            <button class="btn btn-outline-primary btn-copy-invite" type="button" data-invite="{{ $inviteUrl }}">
                                                <i class="fas fa-copy"></i> Copy
                                            </button>
                                        </div>
                                    </div>
                                    <small class="text-muted">Share this link with users so they can join the games.</small>
                                </div>
                            @endif
                            <div class="row">
                                <div class="col-md-6">
                                    <strong><i class="fas fa-box mr-1"></i> Package</strong>
                                    <p class="text-muted mb-2">{{ $package?->name ?? '-' }}</p>
                                    <hr>
                                    <strong><i class="fas fa-gamepad mr-1"></i> Included Games</strong>
                                    @if($activity?->games?->count())
                                        <ul class="text-muted list-unstyled mb-0">
                                            @foreach($activity->games as $game)
                                                <li><i class="fas fa-check-circle text-success mr-1"></i> {{ $game->title }}</li>
                                            @endforeach
                                        </ul>
                                    @else
                                        <p class="text-muted mb-0">No games linked.</p>
                                    @endif
                                </div>
                                <div class="col-md-6">
                                    <strong><i class="fas fa-clock mr-1"></i> Scheduled At</strong>
                                    <p class="text-muted">{{ $booking->scheduled_date }} at {{ $booking->scheduled_time }}</p>
                                    <hr>
                                    <strong><i class="fas fa-map-marker-alt mr-1"></i> Billing Address</strong>
                                    @if($billing)
                                        <p class="text-muted mb-0">
                                            {{ $billing->billing_address }},
                                            {{ $billing->city }},
                                            {{ $billing->state }} - {{ $billing->pin_code }}
                                        </p>
                                    @else
                                        <p class="text-muted mb-0">-</p>
                                    @endif
                                </div>
                            </div>

                            <div class="mt-4">
                                <h5><i class="fas fa-file-invoice-dollar mr-2"></i>Billing Summary</h5>
                                @if($billing)
                                    <table class="table table-sm table-bordered">
                                        <tr class="bg-light">
                                            <th style="width: 45%;">Package Price</th>
                                            <td>₹{{ number_format((float) $billing->package_price, 2) }}</td>
                                        </tr>
                                        <tr class="bg-light">
                                            <th>GST (18%)</th>
                                            <td>₹{{ number_format((float) $billing->gst_amount, 2) }}</td>
                                        </tr>
                                        <tr class="table-primary">
                                            <th>Total Paid</th>
                                            <th class="text-primary">₹{{ number_format((float) $billing->total_payable, 2) }}</th>
                                        </tr>
                                    </table>
                                @else
                                    <div class="text-muted">No billing information found for this booking.</div>
                                @endif
                            </div>

                            <div class="mt-3">
                                <strong><i class="fas fa-info-circle mr-1"></i> Payment Details</strong>
                                @if($billing)
                                    <div class="text-muted mb-2">
                                        Method: {{ $billing->payment_method ? ucfirst(str_replace('_', ' ', $billing->payment_method)) : '-' }}
                                    </div>
                                    @php $details = $billing->confirmation_details ?? []; @endphp
                                    @if(is_array($details) && count($details))
                                        <div class="table-responsive">
                                            <table class="table table-sm table-striped table-bordered mb-0">
                                                <thead class="bg-light">
                                                    <tr>
                                                        <th style="width:35%;">Field</th>
                                                        <th>Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @foreach($details as $key => $value)
                                                        <tr>
                                                            <td class="text-muted">{{ $key }}</td>
                                                            <td>{{ $value }}</td>
                                                        </tr>
                                                    @endforeach
                                                </tbody>
                                            </table>
                                        </div>
                                    @else
                                        <div class="text-muted">No confirmation details.</div>
                                    @endif
                                @else
                                    <div class="text-muted">-</div>
                                @endif
                            </div>
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
