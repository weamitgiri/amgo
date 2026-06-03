@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Email Templates Management</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item active">Email Templates</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            <div class="card">
                <div class="card-header with-border">
                    <h3 class="card-title">Email Templates List</h3>
                    <div class="card-tools pull-right">
                        <a href="{{ route('admin.email-templates.create') }}" class="btn btn-primary btn-sm">
                            <i class="fa fa-plus"></i> Add New Template
                        </a>
                    </div>
                </div>
                <div class="card-body">
                    <table id="emailTemplatesTable" class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th style="width: 50px;">#</th>
                                <th>Template Name</th>
                                <th>Subject</th>
                                <th>Creator</th>
                                <th>Usage Count</th>
                                <th>Created Date</th>
                                <th>Status</th>
                                <th style="width: 120px;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
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
$(function() {
    let table = $('#emailTemplatesTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '{{ route("admin.email-templates.index") }}',
            data: function(d) {
                d.status = $('#filterStatus').val() || '';
            }
        },
        columns: [
            { data: 'DT_RowIndex', name: 'DT_RowIndex', orderable: false, searchable: false },
            { data: 'name', name: 'name' },
            { data: 'subject', name: 'subject' },
            { data: 'creator', name: 'creator' },
            { data: 'usage', name: 'usage_count', orderable: false, searchable: false },
            { data: 'created_date', name: 'created_at' },
            { data: 'status', name: 'status', orderable: false, searchable: false },
            { data: 'actions', name: 'actions', orderable: false, searchable: false }
        ],
        order: [[5, 'desc']]
    });

    $(document).on('change', '.status-toggle', function() {
        let id = $(this).data('id');
        let status = $(this).is(':checked') ? 1 : 0;

        $.ajax({
            url: '{{ route("admin.email-templates.toggleStatus") }}',
            type: 'POST',
            data: {
                _token: '{{ csrf_token() }}',
                id: id,
                status: status
            },
            success: function(response) {
                if (!response.error) {
                    toastr.success(response.message);
                    table.draw();
                }
            },
            error: function() {
                toastr.error('Error updating status');
            }
        });
    });

    $(document).on('click', '.delete-confirm', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this template?')) {
            $(this).closest('form').submit();
        }
    });
});
</script>
@endsection
