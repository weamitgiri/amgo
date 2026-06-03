@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Games for {{ $activity->title }}</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('admin.activities.index') }}">Activities</a></li>
                        <li class="breadcrumb-item active">Games</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Games List</h3>
                    <div class="card-tools">
                        <a href="{{ route('admin.activity-games.create', $activity->id) }}" class="btn btn-primary btn-sm">
                            <i class="fas fa-plus"></i> Add New Game
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <table class="table table-bordered table-striped" id="games-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($games as $game)
                            <tr>
                                <td>{{ $game->title }}</td>
                                <td>
                                    <span class="badge badge-{{ $game->status === 'active' ? 'success' : 'secondary' }}">
                                        {{ ucfirst($game->status) }}
                                    </span>
                                </td>
                                <td>{{ $game->created_at->format('Y-m-d H:i') }}</td>
                                <td>
                                    <div class="btn-group">
                                        <a href="{{ route('admin.activity-games.show', [$activity->id, $game->id]) }}" class="btn btn-info btn-sm" title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="{{ route('admin.activity-games.edit', [$activity->id, $game->id]) }}" class="btn btn-primary btn-sm" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ route('admin.activity-games.clone', [$activity->id, $game->id]) }}" method="POST" style="display:inline-block;">
                                            @csrf
                                            <button type="submit" class="btn btn-warning btn-sm" title="Clone Game" onclick="return confirm('Clone this game?')">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </form>
                                        <form action="{{ route('admin.activity-games.destroy', [$activity->id, $game->id]) }}" method="POST" style="display:inline-block;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure?')" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
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
        $("#games-table").DataTable({
            "responsive": true,
            "autoWidth": false,
        });
    });
</script>
@endsection
