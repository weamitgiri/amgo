@extends('admin.layouts.default')

<!-- @section('header_css')
    <link rel="stylesheet" href="{{ asset('admin/plugins/datatables-bs4/css/dataTables.bootstrap4.min.css') }}">
    <link rel="stylesheet" href="{{ asset('admin/plugins/datatables-responsive/css/responsive.bootstrap4.min.css') }}">
@endsection -->

@section('content')
    <div class="content-wrapper">
        @include('admin.alert_message')
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h4 class="m-0">Admin List</h4>
                    </div><!-- /.col -->
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="{{ url('/') }}">Dashboard</a></li>
                            <li class="breadcrumb-item active">Admin List</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                <!-- <div class="row">
                <div class="form-group col-md-3">
                 <select name="client_type" class="form-control">
                  <option value="">Client Type</option>
                  <option value="N">Normal</option>
                  <option value="I">Iframe</option>
                </select>
            </div>
            <div class="form-group col-md-3">
              <button type="submit" class="btn btn-primary" id="search">Search</button>
            </div>
        </div>  -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Admin List</h3>
                        <div class="card-tools">
                            @if (\helper::checkRoutePermissions('admin.admin.create'))
                                <a href="{{ url('admin/users-permissions/admin/create') }}"
                                    class="btn btn-outline-primary"><i class="fa fa-plus"></i>
                                    Add a New admin</a>
                            @endif
                        </div>
                    </div>

                    <div class="card-body table-responsive">
                        <table class="table table-hover table-bordered" id="table">
                            <thead>
                                <tr>
                                    <th>Sr.</th>
                                    <th>Role</th>
                                    <th>Admin Name</th>
                                    <th>Email</th>
                                    <th>Join Date</th>
                                    <th>Last Login</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
    </div>
    </section>
    </div>
@endsection


@section('footer_js')
    <!-- <script type="text/javascript" src="{{ asset('admin/plugins/datatables/jquery.dataTables.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('admin/plugins/datatables-bs4/js/dataTables.bootstrap4.min.js') }}">
    </script> -->

    <script type="text/javascript" nonce="{{ csrf_token() }}">
        $(function() {
            var table = $('#table').DataTable({
                /*responsive: true, */
                lengthChange: true,
                autoWidth: false,
                processing: true,
                serverSide: true,
                bDestroy: true,
                /*scrollX: true,*/
                ajax: {
                    url: '{{ route('admin.admin.index') }}',
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false
                    },
                    {
                        data: 'type',
                        name: 'users.type',
                        orderable: false,
                        searchable: false

                    },
                    {
                        data: 'name',
                        name: 'users.name'
                    },
                    {
                        data: 'email',
                        name: 'users.email'
                    },
                    {
                        data: 'created_at',
                        name: 'users.created_at'
                    },
                    {
                        data: 'lastActivity',
                        name: 'users.last_activity'
                    },
                    {
                        data: 'status',
                        name: 'users.status'
                    },
                    {
                        data: 'actions',
                        name: 'actions',
                        orderable: false,
                        searchable: false
                    },
                ]
            });

            $('#search').on('click', function() {
                table.draw();
            });
        });

        $(document).on('change', '.status_change', function() {
            const status = $(this).is(':checked') ? 'active' : 'inactive';
            const id = $(this).data('id');
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });
            $.ajax({
                type: 'post',
                url: "{{ route('admin.admin.statusChange') }}",
                data: {
                    id: id,
                    status: status
                },
                dataType: 'json',
                success: function(response) {
                    toastr.success(response.message);
                },
                error: function(error) {

                }
            });
        })
    </script>
@endsection
