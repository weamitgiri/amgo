@php
    $acceptTypes = collect($allowedTypes)->map(fn ($t) => '.' . $t)->implode(',');
    $typesLabel = strtoupper(implode(', ', $allowedTypes));
    $maxLabel = \App\Http\Requests\Admin\StoreActivityMusicRequest::formatBytes($maxBytes);
@endphp
<div class="card-body">
    @if (request('upload_error') === 'too_large')
        <div class="alert alert-danger alert-dismissible">
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
            <i class="icon fas fa-ban mr-1"></i>
            The upload was larger than the server accepts, so nothing was saved. Music files must be {{ $maxLabel }} or smaller.
        </div>
    @endif

    @if ($errors->any())
        <div class="alert alert-danger alert-dismissible">
            <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
            <h5><i class="icon fas fa-ban mr-1"></i> Please fix the {{ $errors->count() }} error{{ $errors->count() > 1 ? 's' : '' }} below:</h5>
            <ul class="mb-0 pl-3">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label for="title">Music Title <span class="text-danger">*</span></label>
                <input type="text" name="title" id="title" maxlength="150" class="form-control @error('title') is-invalid @enderror" value="{{ old('title', $music->title ?? '') }}" placeholder="Enter music title" required>
                @error('title')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label for="activity_id">Game Activity <span class="text-danger">*</span></label>
                <select name="activity_id" id="activity_id" class="form-control select2 @error('activity_id') is-invalid @enderror" required>
                    <option value="">Select activity</option>
                    @foreach($activities as $activity)
                        <option value="{{ $activity->id }}" {{ (string) old('activity_id', $music->activity_id ?? '') === (string) $activity->id ? 'selected' : '' }}>
                            {{ $activity->title }}{{ $activity->status !== 'active' ? ' (' . ucfirst($activity->status) . ')' : '' }}
                        </option>
                    @endforeach
                </select>
                @error('activity_id')<span class="invalid-feedback d-block"><strong>{{ $message }}</strong></span>@enderror
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label for="music_file">Music File @if(!isset($music))<span class="text-danger">*</span>@endif</label>
                <div class="custom-file">
                    <input type="file" name="music_file" id="music_file" accept="{{ $acceptTypes }},audio/*"
                           class="custom-file-input @error('music_file') is-invalid @enderror" {{ isset($music) ? '' : 'required' }}>
                    <label class="custom-file-label" for="music_file">{{ isset($music) ? 'Choose a file to replace the current one' : 'Choose file' }}</label>
                </div>
                <small class="form-text text-muted">
                    Max size {{ $maxLabel }} · {{ $typesLabel }}.
                    @if($serverLimited)
                        <span class="text-warning">This server's PHP upload limit is lower than 10 MB.</span>
                    @endif
                </small>
                <span class="invalid-feedback d-block" id="music_file_error">@error('music_file')<strong>{{ $message }}</strong>@enderror</span>
                <small class="form-text text-success" id="music_file_info"></small>
                @if(isset($music))
                    <div class="mt-2">
                        <small class="text-muted d-block mb-1">Current file: {{ $music->original_name ?? basename($music->file_path) }} ({{ $music->file_size_label }})</small>
                        <audio controls preload="none" src="{{ $music->file_url }}" style="max-width: 100%;"></audio>
                    </div>
                @endif
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label for="status">Status <span class="text-danger">*</span></label>
                <select name="status" id="status" class="form-control @error('status') is-invalid @enderror">
                    <option value="1" {{ (string) old('status', isset($music) ? (int) $music->status : 1) === '1' ? 'selected' : '' }}>Active</option>
                    <option value="0" {{ (string) old('status', isset($music) ? (int) $music->status : 1) === '0' ? 'selected' : '' }}>Inactive</option>
                </select>
                @error('status')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                <small class="form-text text-muted">Only one track per activity can be active; saving this one as active switches off the activity's other tracks.</small>
            </div>
        </div>
    </div>
</div>

<div class="card-footer text-right">
    <a href="{{ route('admin.music.index') }}" class="btn btn-secondary btn-lg mr-2">Cancel</a>
    <button type="submit" class="btn btn-primary btn-lg px-5" id="music-submit">
        <i class="fas fa-save mr-2"></i>Save Music
    </button>
</div>

@section('footer_js')
<script>
    (function () {
        'use strict';

        var MAX_BYTES = {{ (int) $maxBytes }};
        var MAX_LABEL = @json($maxLabel);
        var SERVER_LIMITED = {{ $serverLimited ? 'true' : 'false' }};
        var TYPES = @json($allowedTypes);
        var TYPES_LABEL = @json($typesLabel);
        var input = document.getElementById('music_file');
        var errorBox = document.getElementById('music_file_error');
        var infoBox = document.getElementById('music_file_info');
        var submit = document.getElementById('music-submit');
        var label = input.parentNode.querySelector('.custom-file-label');
        var placeholder = label.textContent;
        var checkToken = 0;

        function fmt(bytes) {
            return bytes >= 1048576
                ? Math.round((bytes / 1048576) * 10) / 10 + ' MB'
                : Math.max(1, Math.round(bytes / 1024)) + ' KB';
        }

        function duration(secs) {
            secs = Math.round(secs);
            return Math.floor(secs / 60) + ':' + ('0' + (secs % 60)).slice(-2);
        }

        function showError(message) {
            input.value = '';
            label.textContent = placeholder;
            label.classList.remove('selected');
            input.classList.add('is-invalid');
            errorBox.innerHTML = '<strong></strong>';
            errorBox.firstChild.textContent = message;
            infoBox.textContent = '';
            submit.disabled = false;
            if (window.toastr) {
                window.toastr.error(message, '', { timeOut: 8000 });
            }
        }

        function clearMessages() {
            input.classList.remove('is-invalid');
            errorBox.innerHTML = '';
            infoBox.textContent = '';
        }

        function problemWith(file) {
            var ext = (file.name.split('.').pop() || '').toLowerCase();
            if (TYPES.indexOf(ext) === -1 || (file.type && !/^audio\//.test(file.type) && file.type !== 'video/ogg')) {
                return '"' + file.name + '" is not a supported music file. Please choose an ' + TYPES_LABEL + ' file.';
            }
            if (file.size === 0) {
                return '"' + file.name + '" is empty or could not be read. Please choose another file.';
            }
            if (file.size > MAX_BYTES) {
                return '"' + file.name + '" is ' + fmt(file.size) + ' — music files may be at most ' + MAX_LABEL +
                    (SERVER_LIMITED ? ' (this server\'s upload limit)' : '') + '. Please choose a smaller file.';
            }
            return null;
        }

        // Window capture phase runs before the shared admin upload guard (document
        // capture) and the file-name label handler, so a rejected file never reaches them.
        window.addEventListener('change', function (event) {
            if (event.target !== input) return;
            clearMessages();
            var file = input.files && input.files[0];
            if (!file) return;

            var problem = problemWith(file);
            if (problem) {
                event.stopImmediatePropagation();
                showError(problem);
                return;
            }

            // Make sure the browser can actually decode it as audio (catches
            // corrupted files and renamed non-audio files) before it is uploaded.
            // Skipped when this browser cannot play the format at all (the server
            // still validates it).
            var token = ++checkToken;
            var probe = new Audio();
            var mimes = { mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4' };
            var ready = function (secs) {
                submit.disabled = false;
                infoBox.textContent = 'Ready to upload · ' + fmt(file.size) + (isFinite(secs) && secs > 0 ? ' · ' + duration(secs) : '');
            };
            if (!probe.canPlayType(mimes[file.name.split('.').pop().toLowerCase()] || file.type)) {
                ready(NaN);
                return;
            }
            var url = URL.createObjectURL(file);
            submit.disabled = true;
            infoBox.textContent = 'Checking file…';
            probe.preload = 'metadata';
            setTimeout(function () {
                if (token === checkToken && submit.disabled) ready(NaN);
            }, 8000);
            probe.onloadedmetadata = function () {
                if (token !== checkToken) return;
                URL.revokeObjectURL(url);
                ready(probe.duration);
            };
            probe.onerror = function () {
                if (token !== checkToken) return;
                URL.revokeObjectURL(url);
                showError('"' + file.name + '" could not be read as audio. The file may be damaged — please choose another ' + TYPES_LABEL + ' file.');
            };
            probe.src = url;
        }, true);
    })();
</script>
@endsection
