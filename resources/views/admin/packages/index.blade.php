@extends('admin.layouts.default')

@section('content')
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0">Package Management</h1>
                </div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard.home') }}">Dashboard</a></li>
                        <li class="breadcrumb-item active">Packages</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <section class="content">
        <div class="container-fluid">
            <div class="card">
                <div class="card-header">
                    <div class="row">
                        <div class="col-md-4 mb-2">
                            <a href="{{ route('admin.packages.create') }}" class="btn btn-primary btn-sm">
                                <i class="fa fa-plus"></i> Add Package
                            </a>
                        </div>
                        <div class="col-md-3 mb-2">
                            <select id="statusFilter" class="form-control form-control-sm">
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                        <div class="col-md-3 mb-2">
                            <select id="bulkAction" class="form-control form-control-sm">
                                <option value="">Bulk Action</option>
                                <option value="activate">Activate</option>
                                <option value="deactivate">Deactivate</option>
                                <option value="draft">Draft</option>
                                <option value="delete">Delete</option>
                            </select>
                        </div>
                        <div class="col-md-2 mb-2">
                            <button id="applyBulkAction" class="btn btn-dark btn-sm btn-block">Apply</button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <table id="packagesTable" class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="selectAll"></th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Max Users</th>
                                <th>Groups</th>
                                <th>Validity</th>
                                <th>Features</th>
                                <th>Status</th>
                                <th>Purchases</th>
                                <th>Revenue</th>
                                <th>Active Users</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
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
    const table = $('#packagesTable').DataTable({
        processing: true,
        serverSide: true,
        ajax: {
            url: '{{ route("admin.packages.index") }}',
            data: function (d) {
                d.status = $('#statusFilter').val();
            }
        },
        columns: [
            { data: 'id', orderable: false, searchable: false, render: function(data){ return '<input type="checkbox" class="row-select" value="' + data + '">'; } },
            { data: 'name', name: 'name' },
            { data: 'price', name: 'price' },
            { data: 'max_users', name: 'max_users' },
            { data: 'total_groups', name: 'total_groups' },
            { data: 'validity_days', name: 'validity_days', render: function(data){ return data + ' days'; } },
            { data: 'features_display', name: 'features', orderable: false },
            { data: 'status', name: 'status' },
            { data: 'purchase_count', name: 'purchase_count', searchable: false },
            { data: 'revenue_generated', name: 'revenue_generated', searchable: false },
            { data: 'active_users_count', name: 'active_users_count', searchable: false },
            { data: 'created_date', name: 'created_at' },
            { data: 'actions', orderable: false, searchable: false }
        ],
        order: [[11, 'desc']]
    });

    $('#statusFilter').change(function () {
        table.draw();
    });

    $('#selectAll').change(function () {
        $('.row-select').prop('checked', $(this).is(':checked'));
    });

    $(document).on('click', '.delete-confirm', function (e) {
        if (!confirm('Are you sure you want to delete this package?')) {
            e.preventDefault();
        }
    });

    $('#applyBulkAction').click(function () {
        const action = $('#bulkAction').val();
        const ids = $('.row-select:checked').map(function () { return $(this).val(); }).get();

        if (!action || ids.length === 0) {
            toastr.error('Select packages and bulk action.');
            return;
        }

        $.ajax({
            url: '{{ route("admin.packages.bulkAction") }}',
            method: 'POST',
            data: { _token: '{{ csrf_token() }}', action: action, ids: ids },
            success: function (response) {
                if (!response.error) {
                    toastr.success(response.message);
                    table.draw();
                }
            },
            error: function () {
                toastr.error('Bulk action failed.');
            }
        });
    });
});
</script>
@endsection
