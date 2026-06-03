@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Blog Management</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item active">Blogs</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <div class="content">
        <div class="container-fluid">
            @include('admin.alert_message')

            <div class="card">
                <div class="card-header border-bottom-0">
                    <div class="row">
                        <div class="col-md-6">
                            <h3 class="card-title">Blogs List</h3>
                        </div>
                        <div class="col-md-6 text-right">
                            <a href="{{ route('admin.blogs.create') }}" class="btn btn-primary btn-sm">
                                <i class="fas fa-plus"></i> Add New Blog
                            </a>
                            <button class="btn btn-success btn-sm" data-toggle="modal" data-target="#blogModal">
                                <i class="fas fa-plus"></i> Quick Add
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-body">
                    <div class="table-responsive">
                        <table id="blogTable" class="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Author</th>
                                    <th>Status</th>
                                    <th>Featured</th>
                                    <th>Publish Date</th>
                                    <th>Views</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
                    @php
                        $categories = \App\Models\BlogCategory::where('status', 1)->get();
                        $tags = \App\Models\BlogTag::where('status', 1)->get();
                        $authors = \App\Models\User::where('usertype', '<=', 1)->get();
                    @endphp

                    @include('admin.blogs.modal')
                    @include('admin.partials.delete-confirmation-modal')
</div>

@section('footer_js')
<script>
$(document).ready(function() {
    var blogTable = $('#blogTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: '{{ route("admin.blogs.index") }}',
        columns: [
            {data: 'id', name: 'id', width: '50px'},
            {data: 'title', name: 'title'},
            {data: 'category', name: 'category'},
            {data: 'author', name: 'author'},
            {data: 'status', name: 'status'},
            {data: 'is_featured', name: 'is_featured', orderable: false},
            {data: 'published_at', name: 'published_at'},
            {data: 'views_count', name: 'views_count'},
            {
                data: 'actions',
                name: 'actions',
                orderable: false,
                searchable: false,
                render: function(data) {
                    var baseUrl = '{{ url("admin/blogs") }}';
                    return `
                        <div class="btn-group btn-group-sm">
                            <a href="${baseUrl}/${data}/edit" class="btn btn-info" title="Edit">
                                <i class="fas fa-edit"></i>
                            </a>
                            <a href="${baseUrl}/${data}" class="btn btn-success" title="View">
                                <i class="fas fa-eye"></i>
                            </a>
                            <button type="button" class="btn btn-danger btn-sm delete-confirm-btn" data-action="${baseUrl}/${data}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ]
    });

    $(document).on('click', '.delete-confirm-btn', function() {
        var action = $(this).data('action');
        $('#deleteConfirmForm').attr('action', action);
        $('#deleteConfirmModal').modal('show');
    });

    $(document).on('submit', '#deleteConfirmForm', function() {
        return true;
    });

    $(document).on('submit', '#blog-modal-form', function(e) {
        e.preventDefault();
        var form = this;
        var $form = $(form);
        var $btn = $form.find('button[type="submit"]');
        $btn.prop('disabled', true);
        $('#blog-modal-errors').addClass('d-none').empty();

        var action = $form.attr('action');
        var method = ($form.find('input[name="_method"]').val() || 'POST').toUpperCase();
        var data = new FormData(form);

        $.ajax({
            url: action,
            type: method,
            headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
            data: data,
            contentType: false,
            processData: false,
            success: function(res) {
                $('#blogModal').modal('hide');
                blogTable.ajax.reload(null, false);
                $('<div class="alert alert-success mt-2">Saved successfully.</div>').prependTo('.content').delay(2500).fadeOut();
            },
            error: function(xhr) {
                if (xhr.status === 422 && xhr.responseJSON && xhr.responseJSON.errors) {
                    var errors = xhr.responseJSON.errors;
                    var $err = $('#blog-modal-errors').removeClass('d-none');
                    $.each(errors, function(k, v) { $err.append('<div>' + v[0] + '</div>'); });
                } else {
                    alert('An error occurred.');
                }
            },
            complete: function() { $btn.prop('disabled', false); }
        });
    });
});
</script>
@endsection
@endsection
