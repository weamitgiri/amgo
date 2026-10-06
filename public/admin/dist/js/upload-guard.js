/**
 * Admin upload guard — stops an oversized or wrong-type upload in the browser
 * with a toast, instead of letting the request fail on the server (PHP silently
 * dropping the file, or nginx answering "413 Request Entity Too Large").
 *
 * Per-file limit, first match wins, always capped by PHP's upload_max_filesize:
 *   1. data-max-mb on the <input type="file">
 *   2. the form's data-upload-limits JSON, keyed by the field's last name
 *      segment ("role_icon" for roles[0][role_icon], "bg_image" for bg_image)
 *   3. the form's data-upload-default-mb
 * Allowed extensions: data-upload-types on the input or form ("jpg,png,webp");
 * otherwise an input with accept="image/*" just requires an image.
 * Whole-request limit (window.ADMIN_UPLOAD_LIMITS.requestBytes) is checked on
 * submit, for forms with at least one file selected.
 */
(function () {
  'use strict';

  var LIMITS = window.ADMIN_UPLOAD_LIMITS || {};
  var MB = 1024 * 1024;
  var TOAST = { timeOut: 8000, extendedTimeOut: 3000 };

  function fmt(bytes) {
    return bytes >= MB
      ? Math.round((bytes / MB) * 10) / 10 + ' MB'
      : Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }

  function toast(message) {
    if (window.toastr) {
      window.toastr.error(message, '', TOAST);
    } else {
      window.alert(message);
    }
  }

  function parseJson(text) {
    try {
      return text ? JSON.parse(text) : null;
    } catch (e) {
      return null;
    }
  }

  function fieldKey(name) {
    var match = /\[([^\]]+)\]$/.exec(name || '');
    return match ? match[1] : name || '';
  }

  function maxBytesFor(input) {
    var bytes = 0;
    var own = parseFloat(input.getAttribute('data-max-mb'));
    var form = input.form;
    if (own > 0) {
      bytes = own * MB;
    } else if (form) {
      var map = parseJson(form.getAttribute('data-upload-limits'));
      var key = fieldKey(input.name);
      var fallback = parseFloat(form.getAttribute('data-upload-default-mb'));
      if (map && map[key] > 0) {
        bytes = map[key] * MB;
      } else if (fallback > 0) {
        bytes = fallback * MB;
      }
    }
    if (LIMITS.fileBytes > 0) {
      bytes = bytes > 0 ? Math.min(bytes, LIMITS.fileBytes) : LIMITS.fileBytes;
    }
    return bytes;
  }

  function allowedTypes(input) {
    var list = input.getAttribute('data-upload-types') || (input.form && input.form.getAttribute('data-upload-types'));
    return list
      ? list.toLowerCase().split(',').map(function (s) { return s.trim(); }).filter(Boolean)
      : null;
  }

  function problemWith(input, file) {
    var types = allowedTypes(input);
    var ext = (file.name.split('.').pop() || '').toLowerCase();
    if (types && types.indexOf(ext) === -1) {
      return '"' + file.name + '" is not a supported file type. Please use ' + types.join(', ').toUpperCase() + '.';
    }
    if (!types && /image/.test(input.getAttribute('accept') || '') && !/^image\//.test(file.type)) {
      return '"' + file.name + '" is not an image. Please choose an image file.';
    }
    var max = maxBytesFor(input);
    if (max > 0 && file.size > max) {
      return '"' + file.name + '" is ' + fmt(file.size) + ' — the maximum allowed here is ' + fmt(max) + '. Please choose a smaller image.';
    }
    return null;
  }

  function resetInput(input) {
    input.value = '';
    var label = input.parentNode && input.parentNode.querySelector('.custom-file-label');
    if (label) {
      label.textContent = label.getAttribute('data-placeholder') || 'Choose file';
      label.classList.remove('selected');
    }
  }

  // Capture phase, so a rejected file never reaches the page's own change
  // handlers (file-name labels, previews).
  document.addEventListener('change', function (event) {
    var input = event.target;
    // Summernote's own insert-image input is the editor's business, not a form upload.
    if (!input || input.type !== 'file' || input.classList.contains('note-image-input')) return;

    var label = input.parentNode && input.parentNode.querySelector('.custom-file-label');
    if (label && !label.hasAttribute('data-placeholder') && !label.classList.contains('selected')) {
      label.setAttribute('data-placeholder', label.textContent);
    }

    var files = Array.prototype.slice.call(input.files || []);
    for (var i = 0; i < files.length; i++) {
      var problem = problemWith(input, files[i]);
      if (problem) {
        resetInput(input);
        toast(problem);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return;
      }
    }
  }, true);

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement) || !(LIMITS.requestBytes > 0)) return;

    var selected = 0;
    Array.prototype.forEach.call(form.querySelectorAll('input[type="file"]'), function (input) {
      if (!input.disabled && input.name) selected += (input.files || []).length;
    });
    if (!selected) return;

    var total = 0;
    new FormData(form).forEach(function (value) {
      total += typeof value === 'string' ? new Blob([value]).size : value.size;
    });

    if (total > LIMITS.requestBytes) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toast(
        'These uploads add up to ' + fmt(total) + ', but the server accepts at most ' + fmt(LIMITS.requestBytes) +
          ' per save. Please upload fewer images at a time (save, then add the rest) or use smaller images.'
      );
    }
  }, true);
})();
