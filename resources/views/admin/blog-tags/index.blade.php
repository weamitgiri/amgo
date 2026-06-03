@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1 class="m-0">Blog Tags</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item active">Blog Tags</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            <div class="card">
                <div class="card-header">
                    <a href="{{ route('admin.blog-tags.create') }}" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Add Tag</a>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="tagTable" class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Slug</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
@endsection

@section('footer_js')
<script>
$(function () {
    $('#tagTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: '{{ route("admin.blog-tags.index") }}',
        columns: [
            { data: 'id', name: 'id', width: '50px' },
            { data: 'name', name: 'name' },
            { data: 'slug', name: 'slug' },
            { data: 'status', name: 'status', width: '100px' },
            {
                data: 'actions',
                name: 'actions',
                orderable: false,
                searchable: false,
                render: function(data) {
                    var baseUrl = '{{ url("admin/blog-tags") }}';
                    return `
                        <div class="btn-group btn-group-sm">
                            <a href="${baseUrl}/${data}/edit" class="btn btn-info"><i class="fas fa-edit"></i></a>
                            <form action="${baseUrl}/${data}" method="POST" style="display:inline;">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger" onclick="return confirm('Delete this tag?');"><i class="fas fa-trash"></i></button>
                            </form>
                        </div>
                    `;
                }
            }
        ]
    });
});
</script>
@endsection
