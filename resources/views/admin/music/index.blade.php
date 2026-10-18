@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1>Music Manager</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.index') }}">Home</a></li>
                        <li class="breadcrumb-item active">Music Manager</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Music List</h3>
                    <div class="card-tools">
                        <a href="{{ route('admin.music.create') }}" class="btn btn-primary btn-sm">
                            <i class="fas fa-plus"></i> Add New Music
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <p class="text-muted mb-3">
                        <i class="fas fa-info-circle mr-1"></i>
                        The active track of an activity plays in the background on that activity's game pages. Only one track per activity can be active — activating a track switches off the activity's other tracks.
                    </p>
                    <table class="table table-bordered table-striped" id="music-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Activity</th>
                                <th>Preview</th>
                                <th>Size</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($tracks as $track)
                            <tr>
                                <td>
                                    {{ $track->title }}
                                    @if($track->original_name)
                                        <br><small class="text-muted">{{ $track->original_name }}</small>
                                    @endif
                                </td>
                                <td>{{ $track->activity->title ?? '—' }}</td>
                                <td>
                                    <audio controls preload="none" src="{{ $track->file_url }}" style="max-width: 240px; height: 32px;"></audio>
                                </td>
                                <td data-order="{{ $track->file_size }}">{{ $track->file_size_label }}</td>
                                <td data-order="{{ $track->status ? 1 : 0 }}">
                                    <div class="custom-control custom-switch custom-switch-off-danger custom-switch-on-success">
                                        <input type="checkbox" class="custom-control-input music-status-toggle" id="music-status-{{ $track->id }}"
                                               data-id="{{ $track->id }}" data-activity="{{ $track->activity_id }}" {{ $track->status ? 'checked' : '' }}>
                                        <label class="custom-control-label" for="music-status-{{ $track->id }}">
                                            <span class="music-status-label">{{ $track->status ? 'Active' : 'Inactive' }}</span>
                                        </label>
                                    </div>
                                </td>
                                <td>{{ $track->created_at->format('Y-m-d H:i') }}</td>
                                <td>
                                    <a href="{{ route('admin.music.edit', $track->id) }}" class="btn btn-primary btn-sm" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <form action="{{ route('admin.music.destroy', $track->id) }}" method="POST" style="display:inline-block;">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-danger btn-sm" title="Delete" onclick="return confirm('Delete this music and its file? This cannot be undone.')">
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
        $("#music-table").DataTable({
            "responsive": true,
            "autoWidth": false,
            "order": [],
        });

        function setSwitch($input, on) {
            $input.prop('checked', on);
            $input.closest('td').attr('data-order', on ? 1 : 0)
                .find('.music-status-label').text(on ? 'Active' : 'Inactive');
        }

        $(document).on('change', '.music-status-toggle', function () {
            var $input = $(this);
            var wanted = $input.is(':checked');
            $input.prop('disabled', true);

            $.ajax({
                url: '{{ route("admin.music.toggleStatus") }}',
                type: 'POST',
                data: { _token: '{{ csrf_token() }}', id: $input.data('id') },
                success: function (response) {
                    setSwitch($input, !!response.status);
                    if (response.status) {
                        // The server switched off this activity's other tracks.
                        $('.music-status-toggle[data-activity="' + $input.data('activity') + '"]').not($input).each(function () {
                            setSwitch($(this), false);
                        });
                    }
                    toastr.success(response.message);
                },
                error: function () {
                    setSwitch($input, !wanted);
                    toastr.error('Could not update the music status. Please try again.');
                },
                complete: function () {
                    $input.prop('disabled', false);
                }
            });
        });
    });
</script>
@endsection
