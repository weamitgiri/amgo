// Users list index
base_url = $('meta[name="base-url"]').attr('content');
$(document).ready(function () {  
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
            //url:'{{ route("admin.users.index")}}',
            url: base_url+'/admin/users-permissions/users',
            data: function(d) {
                d.role_type = $('select[name=role_type]').val();
            }
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
          name: 'name'
      },  
      {
          data: 'image',
          name: 'image'
      }, 
      {
          data: 'phone',
          name: 'phone'
      },
       {
          data: 'email',
          name: 'email'
      },
      {
          data: 'created',
          name: 'created_at'
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
    url: "users/status-change",
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

//create user 13-06-2024
$(document).ready(function(){
  if($("#new_password").val() == ''){
    generateRandomString();
  }

  $('#generateRandomString').on('click',function(){
    generateRandomString();
  });
});

function generateRandomString(length=12) {
  var password = "";
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?';
  for (var i = 0; i < length; i++){
      password += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  $("input[name='new_password']").val(password);
}

/*@if(empty(old('new_password')))
@endif*/

$("select[name='role_id']").select2({placeholder:'Please select role',allowClear: true});

// edit users
$("#generateRandomString1").on('click',function(){
  generateRandomString1();
});

function generateRandomString1(length=12) {
  var password = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?";
  for (var i = 0; i < length; i++){
    password += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  $("input[name='new_password']").val(password);
}

$(document).on('change','#file', function(){
  const file = this.files[0];
  if (file){
    let reader = new FileReader();
    reader.onload = function(event){
      $('#ImageShow').attr('src', event.target.result);
  }
  reader.readAsDataURL(file);
}else{
    $('#ImageShow').attr('src','');
}
});

$(document).ready(function () {  
  $('form').validate({
    rules: {
      order_no: {
        required: true,
    },
    status: {
        required: true,
    }
},
messages: {
  order_no: {
    required: "This order no field is required.",
},
status: {
    required: "Please select status.",
}
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