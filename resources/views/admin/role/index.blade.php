@extends('admin.layouts.default')
 

@section('content')
  <div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h4 class="m-0">Roles List</h4>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="{{ url('admin/dashboard')}}">Dashboard</a></li>
              <li class="breadcrumb-item active">Roles List</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <section class="content">
      <div class="container-fluid">
        <!-- <form method="get">
        <div class="row">
          <div class="form-group col-md-8">    
            <input type="text" class="form-control" name="search"  autocomplete="off" placeholder="Search with name ,email">
          </div>
           <div class="col-md-2">    
            <button type="submit" class="btn btn-primary">Search</button>
            <a href="{{ url('sub-admin')}}" class="btn btn-default">Clear</a>
          </div>
        </div>
        </form> -->
       <div class="card">
        <div class="card-header">
         <!-- <h3 class="card-title">Roles list</h3> -->
         @if(\helper::checkRoutePermissions("admin.role.create"))
            <div class="card-tools">
              <a href="{{ url('admin/users-permissions/role/create')}}" class="btn btn-outline-primary btn-sm"><i class="fa fa-plus"></i> Add a new Role</a>
            </div>
          @endif
        </div>

        <div class="card-body table-responsive">
          <table class="table table-hover table-bordered nowrap" id="table">
          <thead>
          <tr>
          <th>Sr.</th>
          <th>Name</th>
          <th>Created Date</th>
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
            responsive: true, 
            lengthChange: true, 
            autoWidth: false,
            processing: true,
            serverSide: true,
            bDestroy: true,
            ajax: {
              url:''
            },
            columns: [{
                    data: 'DT_RowIndex',
                    orderable: false,
                    searchable: false
                },
                {
                    data: 'name',
                    name: 'name'
                },
                
                {
                    data: 'created_at',
                    name: 'roles.created_at'
                },
                {
                    data: 'status',
                    name: 'roles.status'
                },
                {
                    data: 'actions',
                    name: 'actions',
                    orderable: false,
                    searchable: false
                },
            ]
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
          url: "{{ route('admin.role.statusChange')}}",
          data: { id: id, status: status},
          dataType: 'json',
          success: function (response) {
            toastr.success(response.message);
          },
          error: function (error) {

          }
      });
   })

  </script>
@endsection
