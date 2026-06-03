@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Activities</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item active">Activities</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Activity List</h3>
                    <div class="card-tools">
                        <a href="{{ route('admin.activities.create') }}" class="btn btn-primary btn-sm">
                            <i class="fas fa-plus"></i> Add New Activity
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <table class="table table-bordered table-striped" id="activities-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Games Count</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($activities as $activity)
                            <tr>
                                <td>{{ $activity->title }}</td>
                                <td>
                                    <span class="badge badge-{{ $activity->status === 'active' ? 'success' : 'secondary' }}">
                                        {{ ucfirst($activity->status) }}
                                    </span>
                                </td>
                                <td>{{ $activity->games_count }}</td>
                                <td>{{ $activity->created_at->format('Y-m-d H:i') }}</td>
                                <td>
                                    <a href="{{ route('admin.activity-games.index', $activity->id) }}" class="btn btn-info btn-sm" title="View Games">
                                        <i class="fas fa-gamepad"></i>
                                    </a>
                                    <a href="{{ route('admin.activities.edit', $activity->id) }}" class="btn btn-primary btn-sm" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <form action="{{ route('admin.activities.destroy', $activity->id) }}" method="POST" style="display:inline-block;">
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
        $("#activities-table").DataTable({
            "responsive": true,
            "autoWidth": false,
        });
    });
</script>
@endsection
