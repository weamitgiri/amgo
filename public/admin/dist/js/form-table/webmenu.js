// WebMenu list index
base_url = $('meta[name="base-url"]').attr('content');
  
$(document).on('click', '.openPopup', function(e) {
       e.preventDefault(); // prevent the default link behavior
       var url = $(this).attr('href'); // get the URL from the href attribute
      //alert("ok")
       $.ajax({
         url: url,
         type: 'GET',
         success: function(data) {
          // populate the dynamic content of the modal
          $('#delete_confirm').html(data);
          // show the modal
          $('#myModal').modal('show');
       },
       error: function(jqXHR, textStatus, errorThrown) {
           console.log('Error:', errorThrown);
       }
   });
});

$(document).ready(function () {  
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
          url:base_url+'/admin/home/webmenu',
        },
      columns: [{
          data: 'DT_RowIndex',
          orderable: false,
          searchable: false
      },
      {
          data: 'name_menu',
          name: 'name_menu'
      }, 
      {
          data: 'slug',
          name: 'slug'
      },
      {
        data: 'status',
        name: 'status',
        orderable: false,
        searchable: false
      },
      {
        data: 'created_at',
        name: 'created_at'
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
        url: "webmenu/status-change",
        data: { id: id, status: status},
        dataType: 'json',
        success: function (response) {
            toastr.success(response.message);
        },
        error: function (error) {
            console.log(error);
        }
    });
});

//create web menu
$('.urlDiv').hide();
$('.pdfDiv').hide();

  // Handle AJAX request on menu selection change
  $(document).on('change','#parent_id', function() {
  //document.getElementById('parent_id').addEventListener('change', function() {
      const selectedMenuId = this.value;

      // Send AJAX request to fetch submenu options
      fetch(`get-submenu/${selectedMenuId}`)
      .then(response => response.json())
      .then(data => {
          const subMenuSelect = document.getElementById('sub_menu');
              subMenuSelect.innerHTML = 'select menu'; // Clear previous options

              // Clear previous options
              subMenuSelect.innerHTML = '';

// Create the default option
              const defaultOption = document.createElement('option');
              defaultOption.value = '';
              defaultOption.textContent = 'Please select submenu';
              subMenuSelect.appendChild(defaultOption);


              if (data.length === 0) {
                  const defaultOption = document.createElement('option');
                  defaultOption.value = '';
                  defaultOption.textContent = 'No submenus available';
                  subMenuSelect.appendChild(defaultOption);
              } else {
                  data.forEach(subMenu => {
                      const option = document.createElement('option');
                      option.value = subMenu.id;
                      option.textContent = subMenu.menu_name;
                      subMenuSelect.appendChild(option);
                  });
              }

          })
      .catch(error => {
          console.error('Error:', error);
      });
  });

$(document).on('change','#type',function(){
  let type = $(this).val();
  if(type == 'pdf') {
      $('.urlDiv').hide();
      $('.pdfDiv').show();
  }else if(type == 'url') {
      $('.urlDiv').show();
      $('.pdfDiv').hide();
  }else{
      $('.urlDiv').hide();
      $('.pdfDiv').hide();
  }
});

// webmenu child menu list
$(document).ready(function(){

    const searchParams = new URLSearchParams(window.location.search);

    //var url = base_url+'/admin/home/webmenu/child/'+searchParams;
    var url = base_url+'/admin/home/webmenu/'+searchParams;
    console.log(window.location.lastIndexOf('/'));
    console.log(searchParams.pathname);
    console.log("-------------------------");
    console.log(searchParams);
    console.log("-------------------------");
    console.log(url);
    console.log("-------------------------");

    var table = $('#table').DataTable({
        /*
          responsive: true,
        */
        lengthChange: true, 
        autoWidth: false,
        processing: true,
        serverSide: true,
        bDestroy: true,
        /*scrollX: true,*/
        lengthMenu: [[50, 100], [50, 100]],
        ajax: {
          //url:'{{ route("admin.webmenu.ChildMenuList",request("id"))}}',
          //url:base_url+'/admin/home/webmenu/child/'+searchParams,
          url:url,
      },
      columns: [{
          data: 'DT_RowIndex',
          orderable: false,
          searchable: false
      },
      {
          data: 'name_menu',
          name: 'name_menu'
      },
      {
        data: 'status',
        name: 'status',
        orderable: false,
        searchable: false
      },
      {
        data: 'created_at',
        name: 'created_at'
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