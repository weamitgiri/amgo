$(document).ready(function()
{
  $(document).on("submit", ".ajaxform", function(event)
  {
    var posturl = $(this).attr('action');

    var callbackFunction = $(this).attr('data-callback_function');
    if (callbackFunction)
    {
      if (callbackForm(callbackFunction) == false)
      {
        return false;
      }
    }
    var btn_txt;
    var formid = $(this).attr('id');
    if (formid)
      var formid = '#' + formid;
    else
      var formid = ".ajaxform";

    $(this).ajaxSubmit(
    {
      url: posturl,
      dataType: 'json',
      beforeSend: function()
      {
        // alert(posturl);
        $(formid).find(".form-group").removeClass('has-error');
        $(formid).find(".help-block.text-danger").remove();

        $(formid).find('.alert').removeClass('alert-success').removeClass('alert-danger').removeClass('alert-info');
        $(formid).find('.alert').addClass('alert-info').children('.ajax_message').html('<p><strong>Please wait! </strong>Your action is in proccess...</p>');

        btn_txt = $(formid).find("input[type=submit]").val();
        if (!isset(btn_txt))
        {
          btn_txt = $(formid).find("button[type=submit]").html();
        }

        $(formid).find("button[type=submit]").val('Please wait...');
        $(formid).find("button[type=submit]").html('<i class="fa fa-circle-o-notch fa-spin"></i>&nbsp;Please wait');

        $(formid).find('.alert').fadeIn();

        $(formid).find("button[type=submit]").attr("disabled", "disabled");
        $(formid).find("button[type=submit]").attr("disabled", "disabled");
      },
      success: function(response)
      {
        /*console.log(response);
        return false;*/
        $('.ajaxform').find('.error.formmessage').remove();
        $('.ajaxform').find('.inputTxtError').removeClass('inputTxtError is-invalid');

        $(formid).find("button[type=submit]").removeAttr("disabled");
        $(formid).find("button[type=submit]").removeAttr("disabled");
        $(formid).find("button[type=submit]").val(btn_txt);
        $(formid).find("button[type=submit]").html(btn_txt);

        $('#wait-div').hide();
        $(formid).find('.alert').removeClass('alert-success').removeClass('alert-danger').removeClass('alert-info');

        if (response.restore_error)
        {
          $(formid).find('.alert').show();
          $(formid).find('.alert').html(response.restore_error);
        }
        else if (response.message)
        {
          if (response.success)
          {
            //==================
            var Toast = Swal.mixin(
            {
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
            Toast.fire(
            {
              icon: response.status,
              title: response.message
            })
            //toastr[response.status](response.message, "Notifications");
          }
          else if (response.status)

            // toastr[response.status](response.message, "Notifications");

            var Toast = Swal.mixin(
            {
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
          Toast.fire(
          {
            icon: response.status,
            title: response.message
          })

          if (response.messageNot)
          {
            $(formid).find('.alert').fadeOut(100);
          }
          else
          {
            $(formid).find('.alert').fadeIn(200);

            if (response.success)
            {
              $(formid).find('.alert').fadeIn();
              $(formid).find('.alert').addClass('alert-danger').children('.ajax_message').html(response.message);
            }
            else
            {
              $(formid).find('.alert').fadeIn();
              $(formid).find('.alert').addClass('alert-success').children('.ajax_message').html(response.message);
            }


          }
        }
        else
        {
          $(formid).find('.alert').fadeOut(100);
        }

        if (response.reload == true){
          setTimeout(function () {
            location.reload();
          }, 2000);
        }

        if (response.resetform)
          $(formid).resetForm();
         // $(formid)[0].reset();

        if (response.url)
          // setTimeout(function () {
          window.location.href = response.url;
        //}, 1000);


        if (response.parentUrl)
          window.top.location.href = response.parentUrl;

        if (response.selfReload)
          window.location.reload();

        if (response.slideToThisDiv)
          slideToDiv(response.divId);

        if (response.slideToTop)
          slideToTop();

        if (response.scrollToThisForm)
          slideToElement(formid);

        if (response.ajaxPageCallBack)
        {
          response.formid = formid;
          ajaxPageCallBack(response);

        }

        if (response.ajaxPageCallBack)
        {
          response.formid = formid;
          ajaxPageCallBack(response);

        }

        if (response.popup)
        {
          popup(response.mobileno);

        }
        if (response.ajaxPageCallBackData)
        {
          response.formid = formid;
          ajaxPageCallBackData(response);
        }
        if (response.hideModel)
        {
          setTimeout(function()
          {
            $('.modal').modal('hide');
            table.draw();
          }, 500);
        }
        setTimeout(function()
        {
          $(formid).find('.ajax_report').fadeOut(1000);
        }, 7000);
      },
      error: function(response)
      {
        /*console.log(response.status);
        console.log("===========================");*/

        // 05-06-2024
       /* if(response.status === 419){
          alert('Session expired. Please login again.');
          location.reload();
          return false;
        }*/

        //13-06-2024
        /*if(response.status === 503){
          alert('Service Under Maintenance !!!!');
          location.reload();
          return false;
        }*/

        $(formid).find("input[type=submit]").removeAttr("disabled");
        $(formid).find("button[type=submit]").removeAttr("disabled");
        $(formid).find("input[type=submit]").val(btn_txt);
        $(formid).find("button[type=submit]").html(btn_txt);

        $('#wait-div').hide();
        $(formid).find('.alert').removeClass('alert-success').removeClass('alert-danger').removeClass('alert-info');

        $(formid).find('.alert').fadeOut(100);
        $(formid).find("input[type=submit]").removeAttr("disabled");
        $(formid).find("button[type=submit]").removeAttr("disabled");
        $(formid).find("input[type=submit]").html(btn_txt);
        $(formid).find("button[type=submit]").html(btn_txt);

        // var data = response.responseJSON;
        //   $.each(data, function( key, value ) {
        //       $('.ajaxform').find('label[for="' + key + '"]').remove();
        //                 var msg = '<label class="error formmessage" for="'+key+'"  style="color:red">'+value+'</label>';
        //                  $('.ajaxform').find('input[name="' + key + '"], select[name="' + key + '"],textarea[name="' + key + '"]').addClass('inputTxtError').after(msg);
        //   });


        var data = response.responseJSON;
        $.each(data, function(key, value)
        {
          $('.ajaxform').find('label[for="' + key + '"]').remove();
          var msg = '<label class="error formmessage text-danger" for="' + key + '">' + value + '</label>';
          var inputElement = $('.ajaxform').find('input[name="' + key + '"], select[name="' + key + '"],textarea[name="' + key + '"]');
          inputElement.addClass('inputTxtError is-invalid').after(msg);
        });



        //alert( 'Connection error');
      }
    });
    return false;
  });

  $(document).on("click", ".alert .close", function(event)
  {
    $(this).closest(".ajax_report").hide();
    $(this).closest(".alert").hide();
  });

  $(document).on('keypress', 'input[data-type="number"]', function(key)
  {
    if ((key.charCode < 48 || key.charCode > 57) && (key.charCode != 0)) return false;
  });

  $(document).on('keypress', 'input[data-type="price"],input[data-type="decimal"],input[data-type="percent"],input[data-type="distance"]', function(key)
  {
    if ((key.charCode < 48 || key.charCode > 57) && (key.charCode != 0) && (key.charCode != 46)) return false;
  });



  function amountConversion($this, value)
  {
    if (value != '')
    {
      val = $.isNumeric(value);
      if (val == true)
      {
        var data_id = $($this).attr('data-id');
        if (data_id == 'vote_percent')
          price = (parseFloat(value)).toFixed(1);
        else
          price = (parseFloat(value)).toFixed(2);
        $($this).val(price);
        return true;
      }
    }
  }

});

function slideToElement(element, position)
{
  var target = $(element);

  $('html, body').animate(
  {
    scrollTop: target.offset().top - 100
  }, 500);
}

function slideToDiv(element)
{
  $("html, body").animate(
  {
    scrollTop: $(element).offset().top - 50
  }, 1000);
}

function slideToTop()
{
  $("html, body").animate(
  {
    scrollTop: 50
  }, 1000);
}

function isset(variable)
{
  if (typeof(variable) != "undefined" && variable !== null)
  {
    return true;
  }
  else
  {
    return false;
  }
}

function hide_alert_message()
{
  setTimeout(function()
  {
    $('.alert.alert-dismissable').fadeOut(1000);
  }, 3000);
}

function showToast(type, title)
{
  const Toast = Swal.mixin(
  {
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    onOpen: (toast) =>
    {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  Toast.fire(
  {
    icon: type,
    title: title
  })
}


function ajaxPageCallBack(response)
{
  var CallBackRequest = response.CallBackRequest;
  if (CallBackRequest === 'demo_form')
  {
    $('.tt-search-popup').removeClass('open');
  }
  if (CallBackRequest === 'change_landlord')
  {
    nextSection();
  }

}