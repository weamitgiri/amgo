base_url = $('meta[name="base-url"]').attr('content');

$(function () {
  
  $.validator.setDefaults({
    submitHandler: function () {
      $("button[type='submit']").attr('disabled','disabled');
      $("button[type='submit']").text('Login ....');
      return true;
    }
  });
  $('form').validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
      },
      captcha: {
        required: true,
      }
    },
    messages: {
      email: {
        required: "The email field is required",
        email: "Please enter a valid email address",
      },
      password: {
        required: "The password field is required.",
      },
      captcha: {
        required: "The captcha field is required.",
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

$(document).ready(function() {
  $(".show-password").click(function() {
    var passwordInput = $("input[name='password']");
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