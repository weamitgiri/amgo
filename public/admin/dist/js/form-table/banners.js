// Banners list index
base_url = $('meta[name="base-url"]').attr('content');
$(document).ready(function () {  
    var table = $('#table').DataTable({
        lengthChange: true, 
        autoWidth: false,
        processing: true,
        serverSide: true,
       // bDestroy: true,
        /*responsive: true, 
        scrollX: true,*/
        lengthMenu: [[50, 100], [50, 100]],
          ajax: {
            //url:'{{ route("admin.banners.index")}}',
            url: base_url+'/admin/home/banners',
          },
      columns: [{
          data: 'DT_RowIndex',
          orderable: false,
          searchable: false
      },
      {
        data: 'file',
        name: 'file',
        orderable: false,
        searchable: false
    },
    {
        data: 'order_no',
        name: 'order_no'
    },
    {
        data: 'created_at',
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
      url: "banners/status-change",
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

// create
$(document).ready(function(){
  $('form').validate({
    rules: {
      file: {
        required: true,
      },
      order_no: {
        required: true,
      },
      status: {
        required: true,
      }
    },
    messages: {
      file: {
        required: "Please Select file.",
      },
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

// edit 
$(document).ready(function(){
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