@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1 class="m-0">Cook &amp; Create — Sessions</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item active">Cook &amp; Create — Sessions</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            @include('admin.cook-and-create.partials.subnav', ['ccActive' => 'admin.cook-and-create.sessions'])

            <div class="card">
                <div class="card-header">
                    <form method="GET" class="form-inline">
                        <input type="text" name="organizer" value="{{ request('organizer') }}" placeholder="Organizer name / company" class="form-control form-control-sm mr-2 mb-1">
                        <input type="text" name="dish_name" value="{{ request('dish_name') }}" placeholder="Dish name" class="form-control form-control-sm mr-2 mb-1">
                        <select name="status" class="form-control form-control-sm mr-2 mb-1">
                            <option value="">All statuses</option>
                            @foreach (['waiting', 'round1', 'round2', 'round3_discussion', 'round3_voting', 'completed'] as $status)
                                <option value="{{ $status }}" {{ request('status') === $status ? 'selected' : '' }}>{{ ucfirst(str_replace('_', ' ', $status)) }}</option>
                            @endforeach
                        </select>
                        <button type="submit" class="btn btn-sm btn-primary mb-1"><i class="fas fa-search"></i> Filter</button>
                        <a href="{{ route('admin.cook-and-create.sessions.index') }}" class="btn btn-sm btn-outline-secondary mb-1 ml-1">Clear</a>
                    </form>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th style="width:60px">ID</th>
                                    <th>Organizer</th>
                                    <th>Group</th>
                                    <th>Dish</th>
                                    <th style="width:130px">Status</th>
                                    <th style="width:90px">Outcome</th>
                                    <th style="width:160px">Finished</th>
                                    <th style="width:80px"></th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($sessions as $session)
                                    <tr>
                                        <td>{{ $session->id }}</td>
                                        <td>{{ $session->group?->booking?->organizer?->company_name ?? $session->group?->booking?->organizer?->name ?? '—' }}</td>
                                        <td>{{ $session->group?->group_name ?? '—' }}</td>
                                        <td>{{ $session->dish_name ?? '—' }}</td>
                                        <td>
                                            <span class="badge badge-{{ $session->status === 'completed' ? 'success' : 'info' }}">
                                                {{ ucfirst(str_replace('_', ' ', $session->status)) }}
                                            </span>
                                        </td>
                                        <td>
                                            @if (is_null($session->group_won))
                                                <span class="text-muted">—</span>
                                            @elseif ($session->group_won)
                                                <span class="badge badge-success">Caught</span>
                                            @else
                                                <span class="badge badge-danger">Escaped</span>
                                            @endif
                                        </td>
                                        <td>{{ $session->finished_at?->format('d M Y, h:i A') ?? '—' }}</td>
                                        <td>
                                            <a href="{{ route('admin.cook-and-create.sessions.show', $session) }}" class="btn btn-sm btn-info">
                                                <i class="fas fa-eye"></i> View
                                            </a>
                                        </td>
                                    </tr>
                                @empty
                                    <tr><td colspan="8" class="text-center text-muted">No sessions match those filters.</td></tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                    {{ $sessions->links() }}
                </div>
            </div>
        </div>
    </section>
</div>
@endsection
