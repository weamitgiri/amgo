// Role list index
base_url = $('meta[name="base-url"]').attr('content');
$(document).ready(function () {  
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
      //url: "{{ route('admin.role.statusChange')}}",
      url: "role/status-change",
      data: { id: id, status: status},
      dataType: 'json',
      success: function (response) {
        toastr.success(response.message);
      },
      error: function (error) {

      }
    });
});

//create role 13-06-2024
$(document).ready(function () {
  $('form').validate({
    rules: {
      name: {
        required: true
      }, 
    },
    messages: {
      name: {
        required: "The Name field is required.",
      },  
    },
    submitHandler: function (form) {
      form.submit();
      $("button[type='submit']").html('<i class="fa fa-spinner fa-spin"></i> Submiting...');
      $("button[type='submit']").prop('disabled', true);
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.form-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    }
  });
});

// edit role
$(document).ready(function () {
  $('form').validate({
    rules: {
      name: {
        required: true
      }, 
    },
    messages: {
      name: {
        required: "The Name field is required.",
      },  
    },
    submitHandler: function (form) {
      form.submit();
      $("button[type='submit']").html('<i class="fa fa-spinner fa-spin"></i> Updating...');
      $("button[type='submit']").prop('disabled', true);
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.form-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    }
  });
});

// assign role to user
  $("select[name='id']").select2({placeholder:'Select Sub Admin',allowClear: true})
  $("select[name='id']").val(0).trigger('change.select2');
 
  $(document).on('click','#save_role_btn',function(event){
    event.preventDefault();
    $("button[name='save_role']").attr('disabled','disabled');
    //var form = this;
    var form = $('#role_form')[0];
    var formData = new FormData(form);
    $.ajax({
        //url: form.action,
        url: base_url+'/admin/users-permissions/role/rolePermissionSave',
        type: 'POST',
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