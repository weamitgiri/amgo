@extends('admin.layouts.default')
 
@section('content') 
 
@php
 @$permissions = explode(',',@$role->permissions);
 @$managers = explode(',',@$role->managers);
@endphp

  <div class="content-wrapper">
    @include('admin.alert_message')
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h4 class="m-0">Permissions</h4>
          </div>
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="{{ url('admin/dashboard')}}">Dashboard</a></li>
              <li class="breadcrumb-item"><a href="{{ url('admin/users-permissions/role')}}">Role</a></li>
              <li class="breadcrumb-item active">Permissions</li>
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
        <h3 class="card-title">{{ $role->name }} </h3>
       <div class="card-tools">
          <a href="{{ url('admin/users-permissions/role')}}"class="btn btn-primary btn-sm"><i class="fa fa-arrow-left" aria-hidden="true"></i> Back</a>
          </div>
        </div>

        <div class="card-body card_body_scroll">
          <form method="POST" id="role_form" action="{{ url('admin/users-permissions/role/rolePermissionSave')}}">
            @csrf
            <input type="hidden" name="u_id" value="{{ encrypt($role->id) }}">

            <div class="row rolesList" id="sortable">
                @foreach(App\Models\Menu::getClientsOrSubadminParentMenuForSubadmin() as $parent)  
                 <div class="col-md-3 form-group">
                    <li class="item" data-id="{{ $parent->id }}">
                       <i class="fa {{$parent->icon}}"></i> &nbsp;&nbsp;<b>{{ $parent->name }}</b>
                     <ul style="list-style-type:none;">
                    @foreach(App\Models\Menu::getClientsOrSubadminSubMenu($parent->id) as $submenu)
                        <li class="{{ request()->is($submenu->link) ? 'active' : '' }}">
                        <input type="checkbox" name="manager_permission[{{$parent->id}}][]" value="{{$submenu->id}}" 
                            {{ (in_array($submenu->id,$managers)) ? 'checked' : '' }}> {{ $submenu->name }}
                            <!-- <span class="text-muted">(Sidebar Menu)</span> -->
                            <ul style="list-style-type:none;">
                                @foreach(App\Models\Menu::getClientOrSubadminActionMenu($parent->id,$submenu->id) as $action)
                                    <li class="">
                                    <input type="checkbox" name="action_permission[]" value="{{$action->id}}"  
                                        {{ (in_array($action->id,$permissions)) ? 'checked' : '' }}> {{ $action->showing_name }}
                                    </li>
                                @endforeach
                            </ul>
                        </li>
                    @endforeach
                     </ul>
                    </li>
                 </div>
                 @endforeach
                </div>
                <div class="row">
                    <div class="col-md-4 offset-md-4">
                      <button type="submit" name="save_role" class="btn btn-primary btn-block">Save</button>
                    </div>
                </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    </section>
  </div>
@endsection


@section("footer_js")

<script type="text/javascript" nonce="{{ csrf_token() }}">

  $("select[name='id']").select2({placeholder:'Select Sub Admin',allowClear: true})
  $("select[name='id']").val(0).trigger('change.select2');
 
  $(document).on('submit','#role_form',function(event){
    event.preventDefault();
    form = this;
    $("button[name='save_role']").attr('disabled','disabled');
    var formData = new FormData(form);
    
    $.ajax({
        url: form.action,
        type: form.method,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(response) {
          if (response.error== true) {
            toastr.error(response.message);
          }
          if (response.error == false) {
            $("#games_table").empty();
            toastr.success(response.message);
            $('html,body').animate({ scrollTop: 0 }, 'slow');
          }
          $("button[name='save_role']").removeAttr('disabled');
        }            
    });
 })

$(document).on('change',"input[type='checkbox']",function(event){

  $(this).siblings('ul').find("input[type='checkbox']").prop('checked', this.checked);

});
</script>
@endsection