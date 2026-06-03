@extends('admin.layouts.default')

@section('content') 
  <div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h4 class="m-0">Pages List</h4>
          </div>
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="{{ url('admin/dashboard')}}">Dashboard</a></li>
              <li class="breadcrumb-item active">Pages </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main content -->
    <section class="content">
      <div class="container-fluid">
       <div class="card">
        <div class="card-header">
        <h3 class="card-title">Pages List </h3>
        <div class="card-tools">
          <!-- <a href="{{ url('admin/pages/create')}}" style="float: right;" class="btn btn-primary"><i class="fa fa-plus"></i> Create New Page</a> -->
          </div>
        </div>

        <div class="card-body table-responsive">
          <table class="table table-bordered table-hover" id="table">
          <thead>
          <tr>
            <th>Sr.</th>
            <th>Title</th>
            <th>Slug</th>
            <th>Description</th>
            <th>Created Date</th>
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
        /*responsive: true, */
        lengthChange: true, 
        autoWidth: false,
        processing: true,
        serverSide: true,
        bDestroy: true,
        /*scrollX: true,*/
        lengthMenu: [[50, 100], [50, 100]],
        ajax: {
          url:'{{ route("admin.pages.index")}}'
        },
        columns: [{
            data: 'DT_RowIndex',
            orderable: false,
            searchable: false
          },
          {
            data: 'title',
            name: 'title'
          },
          {
              data: 'slug',
              name: 'slug'
          },
          {
              data: 'description',
              name: 'description'
          },
          {
              data: 'created_at',
              name: 'created_at'
          },
         /* {
              data: 'status',
              name: 'status'
          },*/
          {
              data: 'actions',
              name: 'actions',
              orderable: false,
              searchable: false
          },
        ]
    });
  });
  </script>
@endsection