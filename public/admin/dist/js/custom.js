base_url = $('meta[name="base-url"]').attr('content');

toastr.options = {
    "closeButton": true,
    "progressBar": true,  
    "debug": false,
    "positionClass": "toast-top-right",
    "onclick": null,
    "fadeIn": 300,
    "fadeOut": 1000,
    "timeOut": 5000,
    "extendedTimeOut": 1000
}

$(document).on('click','.delete_confirm',function(event) {
    var form =  $(this).closest("form");
    event.preventDefault();
    Swal.fire({
        title: `Are you sure you want to delete this record?`,
        text: "If you delete this, it will be gone forever.",
        icon: "warning",
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
    }).then((result) => {
        if (result.isConfirmed) {
            form.submit();
        }else{
            return false;
        }
    });
});

// View Image / Video / PDF
$(document).on('click','.ImgVdoModel',function(){
    var href = $(this).attr('href');
    var type = $(this).data('type');
    var name = $(this).data('name');
    $('.boxName').text(name);
    if(type == 'image')
    {
        $('.boxName').html('Image View');
        $('.imageBox').show();
        $('.videoBox').hide();
        $('.pdfBox').hide();
        $('.imgUrl').attr('src',href);
        /*$('.vdoUrl').attr('src','javascript:;');
        $('.pdfUrl').attr('src','javascript:;');*/
    }else if(type == 'video'){
        $('.boxName').html('Video View');
        $('.videoBox').show();
        $('.imageBox').hide();
        $('.pdfBox').hide();
        $('.vdoUrl').attr('src',href);
        //$('.imgUrl').attr('src','javascript:;');
    }else if(type == 'pdf'){
        $('.boxName').html('PDF View');
        $('.pdfBox').show();
        $('.imageBox').hide();
        $('.videoBox').hide();
        $('.pdfUrl').attr('src',href);
        /*$('.vdoUrl').attr('src','javascript:;');
        $('.imgUrl').attr('src','javascript:;');*/
    }else if(type == 'iframe'){
        $('.boxName').html('Game View');
        $('.iframeBox').show();
        $('.imageBox').hide();
        $('.videoBox').hide();
        $('.pdfBox').hide();
        $('.iframeUrl').attr('src',href);
    }else{
        $('.boxName').html('Content View');
        $('.textBox').show();
        $('.imageBox').hide();
        $('.videoBox').hide();
        $('.pdfBox').hide();
        $('.textVal').html($(this).data('description'));
        /*$('.vdoUrl').attr('src','javascript:;');
        $('.imgUrl').attr('src','javascript:;');*/
    }
});

/*$('table').on('draw.dt', function() {
    $('[data-toggle="tooltip"]').tooltip();
});*/

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

jQuery.validator.addMethod("noSpace", function(value, element) { 
    return value == '' || value.trim().length != 0;  
}, "No space please and don't leave it empty");

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

    if (event.shiftKey && (event.keyCode === 190 || event.keyCode === 188))
    {
        return false;
    }

    // event.keyCode === 88 this key for cut functionality

    if (event.ctrlKey && 
        (event.keyCode === 68 || event.keyCode === 83 ||  event.keyCode === 85 || event.keyCode === 117 || event.keyCode === 190 || event.keyCode === 191 || event.keyCode === 222 || event.keyCode === 80))
    {
        return false;
    }else if (event.ctrlKey && event.shiftKey && event.keyCode == 73 || event.keyCode == 74) { // Prevent Ctrl+Shift+I        
        return false;
    }

    // Disable Ctrl+Shift+I or Ctrl+Shift+J
    /* if (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J")) {
        event.preventDefault();
    } */
});

$(document).on("contextmenu",function(e){        
    e.preventDefault();
});

$(document).on('change','.showImage', function(){
    const file = this.files[0];
    if (file){
        let reader = new FileReader();
        reader.onload = function(event){
        $('.ImageShow').attr('src', event.target.result);
    }
        reader.readAsDataURL(file);
    }else{
        $('.ImageShow').attr('src','');
    }
});

// ===================== Tooltip
$('[data-toggle="tooltip"]').tooltip();


$('table').on('draw.dt', function() {
    $('[data-toggle="tooltip"]').tooltip();
})

"use strict";

jQuery(".file-upload-input").on('change', function() {
    var file = this.files;
    if (file.length > 0) {
        var file = file[0];
        jQuery(this).siblings().eq(0).text(file.name);
    } else {
        jQuery(this).siblings().eq(0).text('Choose file');
    }
});
 

 "use strict";

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#previewImage').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Add the following code if you want the name of the file appear on select
$(".custom-file-input").on("change", function() {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});

$(document).ready(function() {
  $(".show-password").click(function() {
    var passwordInput = $("input[name='new_password']");
    var passwordFieldType = passwordInput.attr("type");

    if (passwordFieldType === "password") {
      passwordInput.attr("type", "text");
      $(this).find("i").removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      passwordInput.attr("type", "password");
      $(this).find("i").removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });
});

$(document).ready(function() {
  $(".show-password-confrim").click(function() {
    var passwordInput = $("input[name='confirm_password']");
    var passwordFieldType = passwordInput.attr("type");

    if (passwordFieldType === "password") {
      passwordInput.attr("type", "text");
      $(this).find("i").removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      passwordInput.attr("type", "password");
      $(this).find("i").removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });
});

/* 04-06-2024 datatable too many request error handling */
$(document).ready(function(){
     $.fn.dataTable.ext.errMode = function (settings, tn, msg) {

    // console.log(settings.jqXHR.status+' >>>>> ');

        if (settings && settings.jqXHR && settings.jqXHR.status == 401) {
            alert('Session expired. Please login again.');
            window.location.href = base_url+"/admin/login";
        }

        if (settings && settings.jqXHR && settings.jqXHR.status == 429) {
            alert('Request Limit Exceeds.');
            location.reload(true);
            return false;
        }

        if (settings && settings.jqXHR && settings.jqXHR.status == 403) {
            alert('Unauthenticated.');
            //location.reload(true);
            window.location.href = base_url+"/admin/login";
            return false;
        }

        if (settings && settings.jqXHR && settings.jqXHR.status == 503) {
            //alert('Service Under Maintenance !!!!.');
            window.location.href = base_url+"/admin/login";
            //location.reload(true);
            return false;
        }

       if (settings && settings.jqXHR && settings.jqXHR.status == 500) {
           alert('Session expired. Please login again.');
            window.location.href = base_url+"/admin/login";
            return false;
        }
    };
});

/* 28-06-2024 ajax error handling */
$( document ).on( "ajaxError", function( event, jqXHR, settings, thrownError ) {

    /*console.log(event);
    console.log("===========================");
    console.log(jqXHR);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(settings);
    console.log("+++++++++++++++++++++++++++");
    console.log(thrownError);
    console.log("****************************");*/

    if(jqXHR && jqXHR.status == 419){
        alert('Session expired. Please login again.');
        window.location.href = base_url+"/admin/login";
        return false;
    }

    if(jqXHR && jqXHR.status == 503){
        alert('Service Under Maintenance 333 !!!!');
        //window.location.href = base_url+"/admin/login";
        location.reload();
        return false;
    }

    if(jqXHR && jqXHR.status == 429){
        //alert('Too many request, Try again after some time !!!!');
        //window.location.href = base_url+"/admin/login";
        location.reload();
        return false;
    }

    if(jqXHR && jqXHR.status == 403){
        alert('Session expired. Please login again.');
        window.location.href = base_url+"/admin/login";
        return false;
    }

    /* if(jqXHR && jqXHR.status == 429){
        alert('Request Limit Exceeds.');
        location.reload(true);
        return false;
    } */
});

$(document).ready(function(){
    let errStatus = $('#errorStatus').val();
    console.log(errStatus+'  -------- ');
    console.log('admin -  custom js ');
    //return false;
    
    if(errStatus == 429){        
        var timeLeft = 15;
        let localTime = localStorage.getItem('localTime');
        // set into local storage
        if(!localTime){
            localStorage.setItem('localTime',timeLeft);
        }
        var timerId = setInterval(countdown, 1000);
    }else if(errStatus == 419){
    //}else if($.inArray(errStatus,[401,419])){
        alert('Session expired. Please login again.');
        window.location.href = base_url+"/admin/login";
    }

    if(errStatus == 401){
        alert('Session expired. Please login again.');
        window.location.href = base_url+"/admin/login";
    }

    if(errStatus == 403){
        alert('Unauthenticated.');
        //location.reload(true);
        window.location.href = base_url+"/admin/login";
        return false;
    }

    if(errStatus == 503){
        alert('Service Under Maintenance !!!!');
        //location.reload(true);
        return false;
    }

    if (errStatus  == 500) {
        alert('Service Under Maintenance !!!!');
        location.reload(true);
        return false;
    }

    function countdown() {
        if (timeLeft == 0) {
            clearTimeout(timerId);
            doSomething();
        } else {
            $('#secMsg').text(timeLeft+' Second');
            timeLeft--;
            localStorage.setItem('localTime',timeLeft);
        }
    }
    function doSomething(){
        localStorage.removeItem('localTime');
        location.reload(true);
    }
});

$(document).ready(function(){
    $('input[name="daterange"]').daterangepicker({
        maxDate: new Date(),
        startDate: moment().subtract(1, 'M').format('YYYY-MM-DD'), // Formatting startDate
        endDate: moment().format('YYYY-MM-DD'), // Formatting endDate
        locale: {
            format: 'YYYY-MM-DD' // Specify the desired date format
        },
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1,
                'month').endOf('month')]
        }
    });
});

/* $(document).ready(function(){
    $('a[data-widget="pushmenu"]').click(function(){
        var $html = $("body");
        if ($html.hasClass('sidebar-mini') 
            && $html.hasClass('layout-fixed')
            && $html.hasClass('sidebar-collapse')
            ) {
            $(".brand-image").attr('src',base_url+"/public/admin/images/logo.png");
        }else{
            $(".brand-image").attr('src',base_url+"/public/admin/images/favicon.png");
        }
    });
}); */