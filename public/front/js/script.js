//Header----------------------
$(document).ready(function () {
    $('#fullScreenButton').on('click', function () {
        // Check if the browser supports Fullscreen API
        if (document.fullscreenElement) {
            // Exit full screen if already in full-screen mode
            document.exitFullscreen();
        } else {
            // Enter full screen for the whole document
            document.documentElement.requestFullscreen();
        }
    });
});

$(document).ready(function () {
    $('.result_select_box').click(function () {
        $('.result_select_box').removeClass('result_select_box_active');
        $(this).addClass('result_select_box_active');
    });
});



// document.addEventListener("DOMContentLoaded", () => {
//     const dynamicTextElement = document.getElementById('dynamic-text');
//     const messages = [
//         "Check your results at your system",
//         "Processing your results...",
//         "System is analyzing data...",
//         "Results will appear shortly",
//         "Thank you for waiting!"
//     ];
//     let messageIndex = 0;

//     // Function to change the message
//     const updateMessage = () => {
//         dynamicTextElement.textContent = messages[messageIndex];
//         messageIndex = (messageIndex + 1) % messages.length; // Loop back to the first message
//     };

//     // Update the message every millisecond (use a more reasonable interval like 500ms or 100ms)
//     setInterval(updateMessage, 1000); // Adjust interval as needed
// });

 
 




function toggleFullScreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        let docEl = document.documentElement;
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
            docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
            docEl.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

$('#fullScreenButton').on('click', toggleFullScreen);















//tab panel script
$("[role='tab']").click(function(e) {
   e.preventDefault();
   $(this).attr("aria-selected", "true");
   $(this).parent().siblings().children().attr("aria-selected", "false");
   var tabpanelShow = $(this).attr("href");
   $(tabpanelShow).attr("aria-hidden", "false");
   $(tabpanelShow).siblings().attr("aria-hidden", "true");
});

$(document).ready(function () {
    $('.tab_list_li .tab-link').on('click', function (e) {
        e.preventDefault();

        // Remove 'active' class from all tabs
        $('.tab_list_li .tab-link').removeClass('active');

        // Add 'active' class to the clicked tab
        $(this).addClass('active');

        // Hide all tab contents
        $('.tab-content .lf_ctabs').attr('aria-hidden', 'true').hide();

        // Show the corresponding tab content
        var target = $(this).attr('href');
        $(target).attr('aria-hidden', 'false').fadeIn();
    });
});



 






// toastr.options = {
//     "closeButton": true,
//     "debug": false,
//     "newestOnTop": true,
//     "progressBar": true,
//     "positionClass": "toast-top-right", // Change to desired position
//     "preventDuplicates": true,
//     "onclick": null,
//     "showDuration": "300",
//     "hideDuration": "1000",
//     "timeOut": "5000",
//     "extendedTimeOut": "1000",
//     "showEasing": "swing",
//     "hideEasing": "linear",
//     "showMethod": "fadeIn",
//     "hideMethod": "fadeOut"
// };
