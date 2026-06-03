@extends('admin.layouts.default')
 

@section('content')
  <div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h4 class="m-0">Sub Admin List</h4>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="{ url('admin/dashboard')}}">Dashboard</a></li>
              <li class="breadcrumb-item active">Sub Admin List</li>
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
        <h3 class="card-title">Sub Admin list</h3>
        <div class="card-tools">
          @if(\helper::checkRoutePermissions('admin.sub-admin.create'))
          <a href="{{ url('admin/users-permissions/sub-admin/create')}}" class="btn btn-outline-primary"><i class="fa fa-plus"></i> 
          Add a New Sub admin</a>
          @endif
          </div>
        </div>

        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover table-bordered" id="table">
            <thead>
            <tr>
            <th>Sr.</th>
            <th>Name</th>
            <th>Email</th>
            <th>Join Date</th>
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
            scrollX: true,
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
          url: "{{ route('admin.sub-admin.statusChange')}}",
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
