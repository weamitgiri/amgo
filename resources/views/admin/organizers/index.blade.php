@extends('admin.layouts.default')

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
                    <h3 class="card-title">Organizer List</h3>
                    <div class="card-tools">
                        <a href="{{ route('admin.organizers.create') }}" class="btn btn-primary btn-sm">
                            <i class="fas fa-plus"></i> Add New Organizer
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <table class="table table-bordered table-striped" id="organizers-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Company</th>
                                <th>Activity</th>
                                <th>Scheduled</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($organizers as $organizer)
                            @php $booking = $organizer->bookings->first(); @endphp
                            <tr>
                                <td>{{ $organizer->name }}</td>
                                <td>{{ $organizer->email }}</td>
                                <td>{{ $organizer->company_name }}</td>
                                <td>
                                    @if($booking)
                                        {{ $booking->activity?->title ?? '-' }}
                                    @else
                                        -
                                    @endif
                                </td>
                                <td>
                                    @if($booking)
                                        {{ $booking->scheduled_date }} at {{ $booking->scheduled_time }}
                                    @else
                                        -
                                    @endif
                                </td>
                                <td>
                                    <span class="badge badge-{{ $organizer->status === 'active' ? 'success' : 'secondary' }}">
                                        {{ ucfirst($organizer->status) }}
                                    </span>
                                </td>
                                <td>
                                    <a href="{{ route('admin.organizers.show', $organizer->id) }}" class="btn btn-info btn-sm" title="View">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="{{ route('admin.organizers.edit', $organizer->id) }}" class="btn btn-primary btn-sm" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <form action="{{ route('admin.organizers.destroy', $organizer->id) }}" method="POST" style="display:inline-block;">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure?')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection

@section('footer_js')
<script>
    $(function () {
        $("#organizers-table").DataTable({
            "responsive": true,
            "autoWidth": false,
        });
    });
</script>
@endsection
