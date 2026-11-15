<div class="card-body">
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

    <div class="card card-outline card-primary">
        <div class="card-header">
            <h3 class="card-title"><i class="fas fa-info-circle mr-2"></i>Basic Information</h3>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="title">Title <span class="text-danger">*</span></label>
                        <input type="text" name="title" id="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title', $activity->title ?? '') }}" placeholder="Enter activity title" required>
                        @error('title')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="slug">Slug <span class="text-danger">*</span></label>
                        <input type="text" name="slug" id="slug" class="form-control @error('slug') is-invalid @enderror" value="{{ old('slug', $activity->slug ?? '') }}" placeholder="activity-slug" required>
                        @error('slug')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                        <small class="text-muted">Auto-generated from title if left empty.</small>
                    </div>
                </div>
                <div class="col-md-12">
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea name="description" id="description" class="form-control summernote @error('description') is-invalid @enderror" placeholder="Enter activity description">{{ old('description', $activity->description ?? '') }}</textarea>
                        @error('description')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="cover_image">Cover Image</label>
                        <div class="custom-file">
                            <input type="file" name="cover_image" id="cover_image" accept="image/*" class="custom-file-input @error('cover_image') is-invalid @enderror">
                            <label class="custom-file-label" for="cover_image">Choose file</label>
                        </div>
                        <small class="form-text text-muted">Max size 2 MB · JPG, PNG, WEBP or SVG.</small>
                        @error('cover_image')<span class="invalid-feedback d-block"><strong>{{ $message }}</strong></span>@enderror
                        @if(isset($activity) && $activity->cover_image)
                            <div class="mt-2">
                                <img src="{{ asset('storage/' . $activity->cover_image) }}" class="img-thumbnail" style="max-height: 120px;">
                            </div>
                        @endif
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="icon">Icon Image</label>
                        <div class="custom-file">
                            <input type="file" name="icon" id="icon" accept="image/*" class="custom-file-input @error('icon') is-invalid @enderror">
                            <label class="custom-file-label" for="icon">Choose file</label>
                        </div>
                        <small class="form-text text-muted">Max size 512 KB · JPG, PNG, WEBP or SVG.</small>
                        @error('icon')<span class="invalid-feedback d-block"><strong>{{ $message }}</strong></span>@enderror
                        @if(isset($activity) && $activity->icon)
                            <div class="mt-2">
                                <img src="{{ asset('storage/' . $activity->icon) }}" class="img-thumbnail" style="max-height: 100px; max-width: 100px;">
                            </div>
                        @endif
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="status">Status <span class="text-danger">*</span></label>
                        <select name="status" id="status" class="form-control select2 @error('status') is-invalid @enderror">
                            <option value="draft" {{ old('status', $activity->status ?? '') === 'draft' ? 'selected' : '' }}>Draft</option>
                            <option value="active" {{ old('status', $activity->status ?? '') === 'active' ? 'selected' : '' }}>Active</option>
                        </select>
                        @error('status')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card card-outline card-secondary mt-4">
        <div class="card-header">
            <h3 class="card-title"><i class="fas fa-cog mr-2"></i>Game Settings</h3>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="lobby_wait_secs">Lobby Wait (seconds)</label>
                        <input type="number" name="lobby_wait_secs" id="lobby_wait_secs" class="form-control @error('lobby_wait_secs') is-invalid @enderror" value="{{ old('lobby_wait_secs', $activity->lobby_wait_secs ?? 900) }}">
                        @error('lobby_wait_secs')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                        <small class="form-text text-muted">e.g. 900 = 15 min</small>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="entry_cutoff_mins">Entry Cutoff (minutes)</label>
                        <input type="number" name="entry_cutoff_mins" id="entry_cutoff_mins" class="form-control @error('entry_cutoff_mins') is-invalid @enderror" value="{{ old('entry_cutoff_mins', $activity->entry_cutoff_mins ?? 15) }}">
                        @error('entry_cutoff_mins')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                        <small class="form-text text-muted">minutes after game start</small>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="auto_expire_days">Auto Expire (days)</label>
                        <input type="number" name="auto_expire_days" id="auto_expire_days" class="form-control @error('auto_expire_days') is-invalid @enderror" value="{{ old('auto_expire_days', $activity->auto_expire_days ?? 5) }}">
                        @error('auto_expire_days')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label>Group Size</label>
                        <input type="text" class="form-control" value="Fixed at 5 players" readonly disabled>
                        <input type="hidden" name="group_size" value="5">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label>Max Questions</label>
                        <input type="text" class="form-control" value="Fixed at 5 questions" readonly disabled>
                        <input type="hidden" name="max_questions" value="5">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label>Question Response Time</label>
                        <input type="text" class="form-control" value="Fixed at 120s (2 min)" readonly disabled>
                        <input type="hidden" name="question_response_secs" value="120">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card card-outline card-info mt-4">
        <div class="card-header">
            <h3 class="card-title"><i class="fas fa-clock mr-2"></i>Time Settings</h3>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-3">
                    <div class="form-group">
                        <label for="game_duration_secs">Game Duration (seconds)</label>
                        <input type="number" name="game_duration_secs" id="game_duration_secs" class="form-control @error('game_duration_secs') is-invalid @enderror" value="{{ old('game_duration_secs', $activity->game_duration_secs ?? 1500) }}">
                        @error('game_duration_secs')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                        <small class="form-text text-muted">e.g. 1200 = 20 min</small>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="form-group">
                        <label for="case_summary_view_secs">Case Summary View (seconds)</label>
                        <input type="number" name="case_summary_view_secs" id="case_summary_view_secs" class="form-control @error('case_summary_view_secs') is-invalid @enderror" value="{{ old('case_summary_view_secs', $activity->case_summary_view_secs ?? 300) }}">
                        @error('case_summary_view_secs')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                        <small class="form-text text-muted">auto-closes after X seconds</small>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="form-group">
                        <label for="strategy_guide_delay_secs">Strategy Guide Delay (seconds)</label>
                        <input type="number" name="strategy_guide_delay_secs" id="strategy_guide_delay_secs" class="form-control @error('strategy_guide_delay_secs') is-invalid @enderror" value="{{ old('strategy_guide_delay_secs', $activity->strategy_guide_delay_secs ?? 120) }}">
                        @error('strategy_guide_delay_secs')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                        <small class="form-text text-muted">force-opens after X seconds</small>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="form-group">
                        <label for="clue_room_unlock_secs">Clue Room Unlock (seconds)</label>
                        <input type="number" name="clue_room_unlock_secs" id="clue_room_unlock_secs" class="form-control @error('clue_room_unlock_secs') is-invalid @enderror" value="{{ old('clue_room_unlock_secs', $activity->clue_room_unlock_secs ?? 600) }}">
                        @error('clue_room_unlock_secs')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                        <small class="form-text text-muted">unlocks X seconds from game start</small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card card-outline card-warning mt-4">
        <div class="card-header">
            <h3 class="card-title"><i class="fas fa-trophy mr-2"></i>Scoring</h3>
        </div>
        <div class="card-body">
            <p class="text-muted mb-3"><i class="fas fa-info-circle mr-1"></i> Mystery Quest scoreboard — the points awarded for each in-game activity. Bonuses are positive, penalties negative. Edit a value and Save; the game uses it live.</p>

            @php
                // #, label, the DB column it maps to, and whether this row owns the
                // editable input. Rows 3+4 share one answer value, 6+7+8 share one
                // vote value, 5+9 share one timeout value — so the duplicates mirror
                // the primary row (shown but not a second input for the same column).
                $mqScoreRows = [
                    ['#' => 1,  'label' => 'Investigator asks a question',               'col' => 'investigator_question_bonus',      'default' => 10,  'edit' => true,  'same' => null],
                    ['#' => 2,  'label' => 'Investigator starts Lie Detector',           'col' => 'lie_detector_init_bonus',          'default' => 5,   'edit' => true,  'same' => null],
                    ['#' => 3,  'label' => 'Player answers Investigator question',       'col' => 'timely_response_bonus',            'default' => 10,  'edit' => true,  'same' => null],
                    ['#' => 4,  'label' => 'Player answers Lie Detector question',       'col' => 'timely_response_bonus',            'default' => 10,  'edit' => false, 'same' => 3],
                    ['#' => 5,  'label' => 'Player fails to answer within time limit',   'col' => 'no_response_penalty',              'default' => -10, 'edit' => true,  'same' => null],
                    ['#' => 6,  'label' => 'Player votes Believable',                    'col' => 'lie_detector_participation_bonus', 'default' => 10,  'edit' => true,  'same' => null],
                    ['#' => 7,  'label' => 'Player votes Suspicious',                    'col' => 'lie_detector_participation_bonus', 'default' => 10,  'edit' => false, 'same' => 6],
                    ['#' => 8,  'label' => 'Player submits Lie Detector vote',           'col' => 'lie_detector_participation_bonus', 'default' => 10,  'edit' => false, 'same' => 6],
                    ['#' => 9,  'label' => 'Player fails to vote in Lie Detector round', 'col' => 'no_response_penalty',              'default' => -10, 'edit' => false, 'same' => 5],
                    ['#' => 10, 'label' => 'Player opens the Clue Room popup',           'col' => 'clue_room_bonus',                  'default' => 10,  'edit' => true,  'same' => null],
                    ['#' => 11, 'label' => 'Player correctly identifies the killer',     'col' => 'role_goal_bonus',                  'default' => 60,  'edit' => true,  'same' => null],
                    ['#' => 12, 'label' => 'Player fails to identify the correct killer','col' => 'role_wrong_penalty',               'default' => -20, 'edit' => true,  'same' => null],
                    ['#' => 13, 'label' => 'Hidden Culprit remains unidentified',        'col' => 'culprit_win_bonus',                'default' => 80,  'edit' => true,  'same' => null],
                ];
            @endphp

            <div class="table-responsive">
                <table class="table table-sm table-bordered mb-0">
                    <thead class="thead-light">
                        <tr>
                            <th style="width:48px">#</th>
                            <th>Game Activity</th>
                            <th style="width:170px">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($mqScoreRows as $row)
                            @php $val = (int) old($row['col'], $activity->{$row['col']} ?? $row['default']); @endphp
                            <tr>
                                <td class="text-muted">{{ $row['#'] }}</td>
                                <td>
                                    {{ $row['label'] }}
                                    @if (! $row['edit'])<small class="text-muted">(same value as #{{ $row['same'] }})</small>@endif
                                </td>
                                <td>
                                    @if ($row['edit'])
                                        <input type="number" name="{{ $row['col'] }}" id="{{ $row['col'] }}"
                                               class="form-control form-control-sm font-weight-bold @error($row['col']) is-invalid @enderror"
                                               value="{{ $val }}" aria-label="{{ $row['label'] }} points">
                                        @error($row['col'])<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                    @else
                                        <input type="number" class="form-control form-control-sm font-weight-bold" value="{{ $val }}" disabled
                                               aria-label="{{ $row['label'] }} points (mirrors #{{ $row['same'] }})">
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <small class="form-text text-muted mt-2">Rule 13 (+80) goes to the Hidden Culprit only when no player identifies them. Penalties (#5, #9, #12) must be zero or negative.</small>
        </div>
    </div>

    <div class="card card-outline card-danger mt-4">
        <div class="card-header">
            <h3 class="card-title"><i class="fas fa-search mr-2"></i>Lie Detector</h3>
        </div>
        <div class="card-body">
            <div class="form-group">
                <div class="custom-control custom-switch custom-switch-off-danger custom-switch-on-success">
                    <input type="checkbox" class="custom-control-input" id="lie_detector_enabled" name="lie_detector_enabled" value="1" {{ old('lie_detector_enabled', $activity->lie_detector_enabled ?? false) ? 'checked' : '' }}>
                    <label class="custom-control-label" for="lie_detector_enabled">Enable Lie Detector</label>
                </div>
            </div>

            <div id="lie_detector_settings" style="{{ old('lie_detector_enabled', $activity->lie_detector_enabled ?? false) ? '' : 'display:none;' }}">
                <div class="row">
                    <div class="col-md-3">
                        <div class="form-group">
                            <label>Max Questions</label>
                            <input type="text" class="form-control" value="Fixed at 3 questions" readonly disabled>
                            <input type="hidden" name="lie_detector_max_questions" value="3">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label>Timer (seconds)</label>
                            <input type="text" class="form-control" value="Fixed at 420s (7 min)" readonly disabled>
                            <input type="hidden" name="lie_detector_timer_secs" value="420">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label for="lie_detector_voting_timer_secs">Voting Timer (seconds)</label>
                            <input type="number" name="lie_detector_voting_timer_secs" id="lie_detector_voting_timer_secs" class="form-control @error('lie_detector_voting_timer_secs') is-invalid @enderror" value="{{ old('lie_detector_voting_timer_secs', $activity->lie_detector_voting_timer_secs ?? 30) }}">
                            @error('lie_detector_voting_timer_secs')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                            <small class="form-text text-muted">seconds for voting</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <label>Voting Options</label>
                            <input type="text" class="form-control" value="Fixed — Believable / Suspicious" readonly disabled>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="card-footer text-right">
    <button type="submit" class="btn btn-primary btn-lg px-5">
        <i class="fas fa-save mr-2"></i>Save Activity
    </button>
</div>

@section('footer_js')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // BS-Custom-File-Input
        if(typeof bsCustomFileInput !== 'undefined') {
            bsCustomFileInput.init();
        }
        // Summernote for activity description
        if (typeof $.fn.summernote !== 'undefined') {
            $('#description').summernote({
                height: 220,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'italic', 'underline', 'clear']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['insert', ['link', 'picture', 'video']],
                    ['view', ['fullscreen', 'codeview', 'help']]
                ]
            });
        }
        // Slug generation
        const titleInput = document.getElementById('title');
        const slugInput = document.getElementById('slug');
        titleInput.addEventListener('keyup', function() {
            if (!slugInput.getAttribute('data-manual')) {
                slugInput.value = titleInput.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w ]+/g, '')
                    .replace(/ +/g, '-');
            }
        });
        slugInput.addEventListener('change', function() {
            slugInput.setAttribute('data-manual', 'true');
        });

        // Lie Detector Toggle
        const lieDetectorToggle = document.getElementById('lie_detector_enabled');
        const lieDetectorSettings = document.getElementById('lie_detector_settings');
        lieDetectorToggle.addEventListener('change', function() {
            if (this.checked) {
                $(lieDetectorSettings).slideDown();
            } else {
                $(lieDetectorSettings).slideUp();
            }
        });
    });
</script>
@endsection
