base_url = $('meta[name="base_url"]').attr('content');

// captcha for new query
$(document).ready(function() {
  $('#reload').click(function () {
    $.ajax({
      type: 'GET',
      url: base_url+'/reload-captcha',
      success: function (data) {
        console.log(data.captcha);
        $(".captcha span").html(data.captcha);
      }
    });
  });
});

/*allow number only*/
$(document).on('keydown',".digitOnly",function (e) {
  // Allow: backspace, delete, tab, escape, enter and .
  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13,110,190]) !== -1 ||
             // Allow: Ctrl+A, Command+A
     (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || 
             // Allow: home, end, left, right, down, up
     (e.keyCode >= 35 && e.keyCode <= 40)) {
                 // let it happen, don't do anything
     return;
}
        // Ensure that it is a number and stop the keypress
if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
}
});

$('.decimal_number').keypress(function(event) {
    if (event.which != 46 && (event.which < 47 || event.which > 59))
    {
        event.preventDefault();
        if ((event.which == 46) && ($(this).indexOf('.') != -1)) {
            event.preventDefault();
        }
    }
});

$(document).ready(function () {    

    $('.numberonly').keypress(function (e) {    

        var charCode = (e.which) ? e.which : event.keyCode    

        if (String.fromCharCode(charCode).match(/[^0-9]/g))    

            return false;                        

    });    
});

$( document ).ready(function() {
    $( ".stringOnly" ).keypress(function(e) {
        var key = e.keyCode;
        if (key >= 48 && key <= 57) {
            e.preventDefault();
        }
    });
});

/*jQuery.validator.addMethod("noSpace", function(value, element) { 
    return value == '' || value.trim().length != 0;  
}, "No space please and don't leave it empty");*/

// On Load Counter =======================
/*var n = localStorage.getItem('on_load_counter');

if (n === null) {
  n = 0;
}
n++;

localStorage.setItem("on_load_counter", n);

nums = n.toString().split('').map(Number);
document.getElementById('CounterVisitor').innerHTML = '';
for (var i of nums) {
  document.getElementById('CounterVisitor').innerHTML += '<span class="counter-item">' + i + '</span>';
}*/

// keys not allow
$(document).keydown(function (event) {

  $(document).keypress("u",function(e) {
    if(e.ctrlKey)
    {
      return false;
  }
  else
  {
      return true;
  }
});
  
    //if (event.keyCode === 121 || event.keyCode === 122 || event.keyCode === 123 || event.keyCode === 222) { 
    if (event.keyCode === 123 || event.keyCode === 222) { 
      // Prevent F12 (123)
      // F11 (122,121)
        return false;
    }

    if (event.shiftKey && (event.keyCode === 190 || event.keyCode === 188 || event.keyCode === 186))
    {
        return false;
    }
    
// event.keyCode === 67 this key for block copy functionality
    // event.keyCode === 88 this for cut

if (event.ctrlKey && 
    (event.keyCode === 68 || event.keyCode === 83 ||  event.keyCode === 65 || event.keyCode === 85 || event.keyCode === 117 || event.keyCode === 190 || event.keyCode === 191 || event.keyCode === 222 || event.keyCode === 80))
{
    return false;
    }else if (event.ctrlKey && event.shiftKey && event.keyCode == 73) { // Prevent Ctrl+Shift+I        
      return false;
  }
});

$(document).on("contextmenu",function(e){
  e.preventDefault();
});

/*$('.clsBtn').on('click',function(){
  $('.containerAlert').css('display','none');
});*/

// datatable record

// $('#example').dataTable({
//    "processing": false,
//   // "bInfo": true,
//    "serverSide": false,
//    "searching":false,
//    "ordering":false,
//    "lengthChange": false,
//    dom:'lBfrtip',
//    "ordering": false,
//    "scrollX": false,
// });

//--------------------------
//  $(document).ready(function() {
//   $('#yearFilter').on('change', function() {
//       var selectedYear = $(this).val();
//       alert("selectedYear")
//       $.ajax({
//           url: url,
//           type: 'GET',
//           data: { year: selectedYear },
//           success: function(response) {
//               $('#recordTableBody').html(response); // Assuming 'recordTableBody' is the tbody element's ID
//           },
//           error: function() {
//               console.log('Error occurred');
//           }
//       });
//   });
// });

/* 04-06-2024 add datatable error handler */
/* $( document ).ready(function() {
    $.fn.dataTable.ext.errMode = function (settings, tn, msg) {

        //console.log(settings.jqXHR.status+' >>>>> ');

        if (settings && settings.jqXHR.status == 429) {
            alert('Request Limit Exceeds.');
            location.reload(true);
            return false;
        }

        if (settings && settings.jqXHR && settings.jqXHR.status == 401) {
            alert('Unauthorized Access !!!!.');
            location.reload(true);
            return false;
        }

        if (settings && settings.jqXHR && settings.jqXHR.status == 503) {
            //alert('Service Under Maintenance !!!!.');
            location.reload(true);
            return false;
        }

        if (settings && settings.jqXHR && settings.jqXHR.status == 503) {
                //alert('Service Under Maintenance !!!!');
                location.reload(true);
                return false;
        }
    };
}); */

$(document).ready(function(){
    let errStatus = $('#errorStatus').val();

    console.log(errStatus);

    

    if(errStatus == 419){
      window.location.href = base_url;
      return false;
    }
    
    if(errStatus == 429){
        var timeLeft = 15;
        var timerId = setInterval(countdown, 1000);
    }
    
    if (errStatus == 401) {
        alert('Session expired. Please login again.');
        //location.reload(true);
        window.location.href = base_url;
        return false;
    }

    if(errStatus == 503){
        alert('Service Under Maintenance !!!!');
        location.reload(true);
        return false;
    }

    if (errStatus  == 500) {
        //alert('Service Under Maintenance !!!!');
        location.reload(true);
        return false;
    }

    function countdown() {
      if (timeLeft == -1) {
        clearTimeout(timerId);
        doSomething();
        } else {
            $('#secMsg').text(timeLeft+' Second');
            timeLeft--;
        }
    }
    function doSomething(){
        location.reload(true);
    }
});