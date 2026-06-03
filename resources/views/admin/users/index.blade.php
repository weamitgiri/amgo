@extends('admin.layouts.default')

@section('content') 
<div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
            <div class="col-sm-6">
                <h4 class="m-0">Users</h4>
            </div>
            <div class="col-sm-6">
                <ol class="breadcrumb float-sm-right">
                    <li class="breadcrumb-item"><a href="{{ url('admin/dashboard')}}">Dashboard</a></li>
                    <li class="breadcrumb-item active">Users</li>
                </ol>
            </div>
        </div>
    </div>
</div>

<!-- Main content -->
<section class="content animate__animated animate__fadeInLeft">
    <div class="container-fluid">
        <div class="card">

            <div class="card-header">
                <div class="row">
                    @if(\helper::checkRoutePermissions("admin.users.create"))
                        <div class="col-md-12 text-right">
                            <a href="{{ url('admin/users-permissions/users/create')}}" class="btn btn-outline-primary">
                                <i class="fa fa-plus"></i> Add User
                            </a>
                        </div>
                    @endif
                   
                </div>
            </div>

            <div class="card-body table-responsive">
                <table class="table table-bordered table-hover" id="table">
                    <thead>
                        <tr>
                            <th>Sr.</th>
                            {{-- <th>Role Name</th> --}}
                            <th>Username</th>
                            <!-- <th>Image</th> -->
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>Balance</th>
                            <th>Registered Date</th>
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

<script type="text/javascript" nonce="{{ csrf_token() }}">
  $(function() {

        var table = $('#table').DataTable({
            lengthChange: true, 
            autoWidth: false,
            processing: true,
            serverSide: true,
            bDestroy: true,
            /*responsive: true, 
            scrollX: true,*/
            lengthMenu: [[50, 100], [50, 100]],
            ajax: {
                url:'{{ route("admin.users.index")}}',
                data: function(d) {
                    d.role_type = $('select[name=role_type]').val();
                }
            },
            columns: [{
                data: 'DT_RowIndex',
                orderable: false,
                searchable: false
            },
        /*{
                data: 'type',
                name: 'users.type',
                orderable: false,
                searchable: false
            },*/
      {
          data: 'user_name',
          name: 'username'
      },  
    /*  {
            data: 'image',
            name: 'image',
            orderable: false,
            searchable: false
      }, */
      {
          data: 'phone',
          name: 'phone'
      },
       {
          data: 'email',
          name: 'email'
      },
      {
          data: 'balance',
          name: 'balance'
      },
      {
          data: 'created',
          name: 'created_at'
      },
      {
          data: 'lastActivity',
          name: 'last_activity'
      },
      {
          data: 'status',
          name: 'status',
          orderable: false,
          searchable: false
      },
      {
          data: 'actions',
          name: 'actions',
          orderable: false,
          searchable: false
      },
      ]
    });

     $("select[name='role_type']").on('change', function() {
        table.draw();
      });
  });

$(document).on('change','.status_change',function(){
    const status = $(this).is(':checked') ? 'active' : 'inactive';
    const id = $(this).data('id');
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    $.ajax({
        type: 'post',
        url: "{{ route('admin.users.statusChange')}}",
        data: { id: id, status: status},
        dataType: 'json',
        success: function (response) {
            if(response.error == true){
                toastr.error(response.message);
                setTimeout(function(){location.reload();}, 2000);
            }else{
                toastr.success(response.message);
            }
        },
        error: function (error) {
            console.log(error);
        }
    });

});
</script>
@endsection