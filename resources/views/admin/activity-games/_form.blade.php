<div class="card-body p-0">
    @php
        // If validation fails, jump user to the step containing the first error.
        $initialStep = 1;
        $errorKeys = $errors->keys();
        if (!empty($errorKeys)) {
            $firstKey = (string) $errorKeys[0];
            if (str_starts_with($firstKey, 'timeline') || str_starts_with($firstKey, 'quick_facts') || str_starts_with($firstKey, 'photos')) {
                $initialStep = 2;
            } elseif (str_starts_with($firstKey, 'roles')) {
                $initialStep = 3;
            } elseif (str_starts_with($firstKey, 'investigator_cards') || str_starts_with($firstKey, 'clues') || str_starts_with($firstKey, 'rules') || str_starts_with($firstKey, 'full_story')) {
                $initialStep = 4;
            }
        }
    @endphp

    @if($errors->any())
        <div class="p-4">
            <div class="alert alert-danger mb-0">
                <div class="d-flex align-items-start">
                    <i class="fas fa-exclamation-triangle mr-2 mt-1"></i>
                    <div>
                        <div class="font-weight-bold">Please fix the highlighted fields.</div>
                        <ul class="mb-0 pl-3">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    @endif

    <!-- Custom Step Wizard Header -->
    <div class="bs-stepper">
        <div class="bs-stepper-header" role="tablist">
            <div class="step" data-target="#step1">
                <button type="button" class="step-trigger" role="tab" aria-controls="step1" id="step1-trigger">
                    <span class="bs-stepper-circle">1</span>
                    <span class="bs-stepper-label">Case Info</span>
                </button>
            </div>
            <div class="line"></div>
            <div class="step" data-target="#step2">
                <button type="button" class="step-trigger" role="tab" aria-controls="step2" id="step2-trigger">
                    <span class="bs-stepper-circle">2</span>
                    <span class="bs-stepper-label">Investigation</span>
                </button>
            </div>
            <div class="line"></div>
            <div class="step" data-target="#step3">
                <button type="button" class="step-trigger" role="tab" aria-controls="step3" id="step3-trigger">
                    <span class="bs-stepper-circle">3</span>
                    <span class="bs-stepper-label">Game Roles</span>
                </button>
            </div>
            <div class="line"></div>
            <div class="step" data-target="#step4">
                <button type="button" class="step-trigger" role="tab" aria-controls="step4" id="step4-trigger">
                    <span class="bs-stepper-circle">4</span>
                    <span class="bs-stepper-label">Game Content</span>
                </button>
            </div>
        </div>

        <div class="bs-stepper-content p-4">
            <!-- STEP 1: CASE INFO -->
            <div id="step1" class="step-content" role="tabpanel" aria-labelledby="step1-trigger">
                <div class="card card-outline card-info">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-file-medical mr-2"></i>General Case Information</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="form-group">
                                    <label for="title">Game Title <span class="text-danger">*</span></label>
                                    <input type="text" name="title" id="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title', $game->title ?? '') }}" placeholder="Enter game title" required>
                                    @error('title')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <label for="status">Status <span class="text-danger">*</span></label>
                                    <select name="status" id="status" class="form-control select2 @error('status') is-invalid @enderror">
                                        <option value="draft" {{ old('status', $game->status ?? '') === 'draft' ? 'selected' : '' }}>Draft</option>
                                        <option value="active" {{ old('status', $game->status ?? '') === 'active' ? 'selected' : '' }}>Active</option>
                                    </select>
                                    @error('status')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label for="case_summary">Case Summary (The Full Story) <span class="text-danger">*</span></label>
                                    <textarea name="case_summary" id="case_summary" class="form-control summernote @error('case_summary') is-invalid @enderror">{{ old('case_summary', $game->case_summary ?? '') }}</textarea>
                                    @error('case_summary')<span class="invalid-feedback d-block"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label for="tagline">Results Page Tagline</label>
                                    <input type="text" name="tagline" id="tagline" class="form-control @error('tagline') is-invalid @enderror" value="{{ old('tagline', $game->tagline ?? '') }}" placeholder="A mystery solved, but at what cost?">
                                    @error('tagline')<span class="invalid-feedback"><strong>{{ $message }}</strong></span>@enderror
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="text-right mt-3">
                    <button type="button" class="btn btn-primary next-step px-4">Next <i class="fas fa-arrow-right ml-1"></i></button>
                </div>
            </div>

            <!-- STEP 2: INVESTIGATION -->
            <div id="step2" class="step-content" role="tabpanel" aria-labelledby="step2-trigger">
                <!-- Timeline -->
                <div class="card card-outline card-secondary">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-history mr-2"></i>Event Timeline</h3>
                        <div class="card-tools">
                            <button type="button" class="btn btn-primary btn-sm add-timeline-item"><i class="fas fa-plus mr-1"></i> Add Event</button>
                        </div>
                    </div>
                    <div class="card-body" id="timeline-container">
                        @php $timeline = old('timeline', $game->timeline ?? []); @endphp
                        @foreach($timeline as $index => $item)
                            <div class="row timeline-item mb-2 animate__animated animate__fadeIn">
                                <div class="col-md-3">
                                    <input type="text" name="timeline[{{ $index }}][time]" class="form-control" value="{{ $item['time'] ?? '' }}" placeholder="10:00 PM">
                                </div>
                                <div class="col-md-8">
                                    <input type="text" name="timeline[{{ $index }}][event]" class="form-control" value="{{ $item['event'] ?? '' }}" placeholder="Event description">
                                </div>
                                <div class="col-md-1">
                                    <button type="button" class="btn btn-outline-danger remove-item btn-block"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

                <!-- Quick Facts -->
                <div class="card card-outline card-secondary mt-4">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-list-ul mr-2"></i>Quick Facts</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Location</label>
                                    <input type="text" name="quick_facts[location]" class="form-control" value="{{ old('quick_facts.location', $game->quick_facts['location'] ?? '') }}" placeholder="London, UK">
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Date/Time</label>
                                    <input type="text" name="quick_facts[date_time]" class="form-control" value="{{ old('quick_facts.date_time', $game->quick_facts['date_time'] ?? '') }}" placeholder="May 24, 10:00 PM">
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Weather</label>
                                    <input type="text" name="quick_facts[weather]" class="form-control" value="{{ old('quick_facts.weather', $game->quick_facts['weather'] ?? '') }}" placeholder="Rainy">
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>CCTV Status</label>
                                    <input type="text" name="quick_facts[cctv_status]" class="form-control" value="{{ old('quick_facts.cctv_status', $game->quick_facts['cctv_status'] ?? '') }}" placeholder="Disabled">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Photos -->
                <div class="card card-outline card-secondary mt-4">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-images mr-2"></i>Investigation Photos (Max 5)</h3>
                        <div class="card-tools">
                            <button type="button" class="btn btn-primary btn-sm add-photo-item"><i class="fas fa-plus mr-1"></i> Add Photo</button>
                        </div>
                    </div>
                    <div class="card-body" id="photos-container">
                        @php $photos = old('photos', isset($game) ? $game->photos : []); @endphp
                        @foreach($photos as $index => $photo)
                            <div class="row photo-item border p-3 mb-2 rounded bg-light animate__animated animate__fadeIn">
                                <div class="col-md-2">
                                    <label>#</label>
                                    <select name="photos[{{ $index }}][photo_number]" class="form-control">
                                        @for($i=1; $i<=5; $i++)
                                            <option value="{{ $i }}" {{ ($photo['photo_number'] ?? $photo->photo_number ?? '') == $i ? 'selected' : '' }}>{{ $i }}</option>
                                        @endfor
                                    </select>
                                </div>
                                <div class="col-md-5">
                                    <label>Label</label>
                                    <input type="text" name="photos[{{ $index }}][label]" class="form-control" value="{{ $photo['label'] ?? $photo->label ?? '' }}" placeholder="Photo description">
                                </div>
                                <div class="col-md-4">
                                    <label>Image</label>
                                    <div class="custom-file">
                                        <input type="file" name="photos[{{ $index }}][image]" class="custom-file-input">
                                        <label class="custom-file-label">Choose photo</label>
                                    </div>
                                    @if(isset($photo->image))
                                        <input type="hidden" name="photos[{{ $index }}][existing_image]" value="{{ $photo->image }}">
                                        <img src="{{ asset('storage/' . $photo->image) }}" class="mt-2 img-thumbnail" style="height:60px;">
                                    @endif
                                </div>
                                <div class="col-md-1 text-right">
                                    <label>&nbsp;</label><br>
                                    <button type="button" class="btn btn-danger remove-item"><i class="fas fa-times"></i></button>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
                <div class="d-flex justify-content-between mt-3">
                    <button type="button" class="btn btn-secondary prev-step px-4"><i class="fas fa-arrow-left mr-1"></i> Previous</button>
                    <button type="button" class="btn btn-primary next-step px-4">Next <i class="fas fa-arrow-right ml-1"></i></button>
                </div>
            </div>

            <!-- STEP 3: GAME ROLES -->
            <div id="step3" class="step-content" role="tabpanel" aria-labelledby="step3-trigger">
                <div class="card card-outline card-warning">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-users mr-2"></i>Game Roles (Exactly 5 Required)</h3>
                        <div class="card-tools">
                            <div class="input-group input-group-sm" style="width: 250px;">
                                <select id="role-type-selector" class="form-control">
                                    <option value="">Select Role Type to Add</option>
                                    <option value="investigator">Investigator</option>
                                    <option value="culprit">Culprit</option>
                                    <option value="suspect">Suspect</option>
                                    <option value="witness">Witness</option>
                                    <option value="participant">Participant</option>
                                </select>
                                <div class="input-group-append">
                                    <button type="button" class="btn btn-success add-role-btn"><i class="fas fa-plus"></i> Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body" id="roles-container">
                        @php $roles = old('roles', isset($game) ? $game->roles : []); @endphp
                        @foreach($roles as $i => $role)
                            @include('admin.activity-games.partials._role_form', ['i' => $i, 'role' => $role])
                        @endforeach
                    </div>
                    <div class="card-footer bg-light border-top">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted"><i class="fas fa-info-circle mr-1"></i> Total Roles: <strong id="role-count">0</strong> / 5</span>
                            <span id="role-validation-msg" class="text-danger font-weight-bold"></span>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-between mt-3">
                    <button type="button" class="btn btn-secondary prev-step px-4"><i class="fas fa-arrow-left mr-1"></i> Previous</button>
                    <button type="button" class="btn btn-primary next-step px-4">Next <i class="fas fa-arrow-right ml-1"></i></button>
                </div>
            </div>

            <!-- STEP 4: GAME CONTENT -->
            <div id="step4" class="step-content" role="tabpanel" aria-labelledby="step4-trigger">
                <!-- Investigator Cards -->
                <div class="card card-outline card-success">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-id-card mr-2"></i>Investigator Cards (Max 4)</h3>
                        <div class="card-tools">
                            <button type="button" class="btn btn-primary btn-sm add-investigator-card"><i class="fas fa-plus mr-1"></i> Add Card</button>
                        </div>
                    </div>
                    <div class="card-body" id="investigator-cards-container">
                        @php $iCards = old('investigator_cards', isset($game) ? $game->investigatorCards : []); @endphp
                        @foreach($iCards as $index => $iCard)
                            <div class="investigator-card-item border p-3 mb-2 rounded bg-light animate__animated animate__fadeIn">
                                <div class="row">
                                    <div class="col-md-2">
                                        <label>#</label>
                                        <select name="investigator_cards[{{ $index }}][card_number]" class="form-control">
                                            @for($cn=1; $cn<=4; $cn++)
                                                <option value="{{ $cn }}" {{ ($iCard['card_number'] ?? $iCard->card_number ?? '') == $cn ? 'selected' : '' }}>{{ $cn }}</option>
                                            @endfor
                                        </select>
                                    </div>
                                    <div class="col-md-5">
                                        <label>Suspect Label</label>
                                        <input type="text" name="investigator_cards[{{ $index }}][suspect_label]" class="form-control" value="{{ $iCard['suspect_label'] ?? $iCard->suspect_label ?? '' }}" placeholder="e.g. Suspect 1: Name">
                                    </div>
                                    <div class="col-md-5">
                                        <label>Tag</label>
                                        <input type="text" name="investigator_cards[{{ $index }}][tag]" class="form-control" value="{{ $iCard['tag'] ?? $iCard->tag ?? '' }}" placeholder="e.g. Primary Suspect">
                                    </div>
                                    <div class="col-md-12 mt-2">
                                        <label>Profile Text</label>
                                        <textarea name="investigator_cards[{{ $index }}][profile_text]" class="form-control" rows="2">{{ $iCard['profile_text'] ?? $iCard->profile_text ?? '' }}</textarea>
                                    </div>
                                    <div class="col-md-5 mt-2">
                                        <label>Appears (seconds)</label>
                                        <input type="number" name="investigator_cards[{{ $index }}][appears_at_secs]" class="form-control" value="{{ $iCard['appears_at_secs'] ?? $iCard->appears_at_secs ?? '' }}">
                                    </div>
                                    <div class="col-md-5 mt-2">
                                        <label>Closes (seconds)</label>
                                        <input type="number" name="investigator_cards[{{ $index }}][closes_at_secs]" class="form-control" value="{{ $iCard['closes_at_secs'] ?? $iCard->closes_at_secs ?? '' }}">
                                    </div>
                                    <div class="col-md-2 mt-2 text-right">
                                        <label>&nbsp;</label><br>
                                        <button type="button" class="btn btn-outline-danger remove-item"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

                <!-- Clue Room & Rules -->
                <div class="row">
                    <div class="col-md-6">
                        <div class="card card-outline card-info h-100">
                            <div class="card-header">
                                <h3 class="card-title"><i class="fas fa-search-location mr-2"></i>Clue Room</h3>
                            </div>
                            <div class="card-body">
                                @php $clue = isset($game->clues) ? $game->clues->first() : null; @endphp
                                <div class="form-group">
                                    <label>Clue Title</label>
                                    <input type="text" name="clues[0][clue_title]" class="form-control" value="{{ old('clues.0.clue_title', $clue->clue_title ?? '') }}">
                                </div>
                                <div class="form-group">
                                    <label>Short Description</label>
                                    <input type="text" name="clues[0][clue_short_description]" class="form-control" value="{{ old('clues.0.clue_short_description', $clue->clue_short_description ?? '') }}">
                                </div>
                                <div class="form-group">
                                    <label>Clue Detail</label>
                                    <textarea name="clues[0][clue_detail]" class="form-control" rows="3">{{ old('clues.0.clue_detail', $clue->clue_detail ?? '') }}</textarea>
                                </div>
                                <div class="form-group">
                                    <label>Clue Image</label>
                                    <div class="custom-file">
                                        <input type="file" name="clues[0][clue_image]" class="custom-file-input">
                                        <label class="custom-file-label">Choose image</label>
                                    </div>
                                    @if(isset($clue->clue_image))
                                        <input type="hidden" name="clues[0][existing_image]" value="{{ $clue->clue_image }}">
                                        <img src="{{ asset('storage/' . $clue->clue_image) }}" class="mt-2 img-thumbnail" style="height:60px;">
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card card-outline card-secondary h-100">
                            <div class="card-header">
                                <h3 class="card-title"><i class="fas fa-gavel mr-2"></i>Game Rules</h3>
                                <div class="card-tools">
                                    <button type="button" class="btn btn-primary btn-sm add-rule-item"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                            <div class="card-body" id="rules-container">
                                @php $rules = old('rules', isset($game->rules) ? $game->rules : []); @endphp
                                @foreach($rules as $index => $rule)
                                    <div class="row rule-item mb-2 animate__animated animate__fadeIn">
                                        <div class="col-md-9">
                                            <input type="text" name="rules[{{ $index }}][rule_text]" class="form-control" value="{{ $rule['rule_text'] ?? $rule->rule_text ?? '' }}" placeholder="Rule text">
                                        </div>
                                        <div class="col-md-2 px-0">
                                            <input type="number" name="rules[{{ $index }}][order]" class="form-control" value="{{ $rule['order'] ?? $rule->order ?? 0 }}">
                                        </div>
                                        <div class="col-md-1">
                                            <button type="button" class="btn text-danger remove-item"><i class="fas fa-times"></i></button>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Full Story -->
                <div class="card card-outline card-primary mt-4">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-book-open mr-2"></i>Full Story Reveal (Max 3 Parts)</h3>
                        <div class="card-tools">
                            <button type="button" class="btn btn-primary btn-sm add-story-item"><i class="fas fa-plus mr-1"></i> Add Part</button>
                        </div>
                    </div>
                    <div class="card-body" id="story-container">
                        @php $stories = old('full_story', isset($game->fullStory) ? $game->fullStory : []); @endphp
                        @foreach($stories as $index => $story)
                            <div class="story-item border p-3 mb-2 rounded bg-light animate__animated animate__fadeIn">
                                <div class="row">
                                    <div class="col-md-2">
                                        <label>Part #</label>
                                        <select name="full_story[{{ $index }}][part_number]" class="form-control">
                                            @for($i=1; $i<=3; $i++)
                                                <option value="{{ $i }}" {{ ($story['part_number'] ?? $story->part_number ?? '') == $i ? 'selected' : '' }}>{{ $i }}</option>
                                            @endfor
                                        </select>
                                    </div>
                                    <div class="col-md-9">
                                        <label>Part Title</label>
                                        <input type="text" name="full_story[{{ $index }}][part_title]" class="form-control" value="{{ $story['part_title'] ?? $story->part_title ?? '' }}">
                                    </div>
                                    <div class="col-md-1 text-right">
                                        <label>&nbsp;</label><br>
                                        <button type="button" class="btn btn-outline-danger remove-item"><i class="fas fa-trash"></i></button>
                                    </div>
                                    <div class="col-md-12 mt-2">
                                        <label>Content</label>
                                        <textarea name="full_story[{{ $index }}][part_body]" class="form-control summernote">{{ $story['part_body'] ?? $story->part_body ?? '' }}</textarea>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>

                <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-secondary prev-step px-4"><i class="fas fa-arrow-left mr-1"></i> Previous</button>
                    <button type="submit" class="btn btn-success btn-lg px-5">
                        <i class="fas fa-check-circle mr-2"></i>Save Game Content
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

@section('header_css')
<style>
    .bs-stepper-header { display: flex; align-items: center; justify-content: center; background: #f4f6f9; border-bottom: 1px solid #dee2e6; }
    .bs-stepper .step-trigger { padding: 1.5rem 1rem; border: none; background: none; display: flex; flex-direction: column; align-items: center; opacity: 0.5; transition: all 0.3s; }
    .bs-stepper .step.active .step-trigger { opacity: 1; color: #007bff; }
    .bs-stepper .bs-stepper-circle { width: 35px; height: 35px; border-radius: 50%; background: #6c757d; color: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; font-weight: bold; }
    .bs-stepper .step.active .bs-stepper-circle { background: #007bff; box-shadow: 0 0 10px rgba(0,123,255,0.4); }
    .bs-stepper .bs-stepper-label { font-size: 0.9rem; font-weight: 600; }
    .bs-stepper .line { flex: 1; height: 1px; background: #dee2e6; margin-top: -2rem; }
    .step-content { display: none; }
    .step-content.active { display: block; animation: fadeIn 0.5s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .summernote-invalid { border: 1px solid #dc3545 !important; }
    .role-item { border-left: 5px solid #ffc107 !important; transition: all 0.3s; }
    .role-item:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
    .strategy-card-item { border-left: 3px solid #17a2b8 !important; }
    .note-editor { margin-bottom: 0 !important; }
</style>
@endsection

@section('footer_js')
<script>
    $(function() {
        // Initialize Summernote
        $('.summernote').summernote({
            height: 250,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ]
        });

        // Step Wizard Logic
        let currentStep = 1;
        const totalSteps = 4;

        function showStep(step) {
            $('.step-content').removeClass('active');
            $(`#step${step}`).addClass('active');
            $('.step').removeClass('active');
            $(`.step[data-target="#step${step}"]`).addClass('active');
            currentStep = step;
            window.scrollTo(0, 0);
        }

        $('.next-step').click(function() {
            if (currentStep < totalSteps) showStep(currentStep + 1);
        });

        $('.prev-step').click(function() {
            if (currentStep > 1) showStep(currentStep - 1);
        });

        $('.step-trigger').click(function() {
            const target = $(this).closest('.step').data('target');
            const step = parseInt(target.replace('#step', ''));
            showStep(step);
        });

        // Open the step that contains the first validation error (if any).
        const initialStep = {{ (int) ($initialStep ?? 1) }};
        showStep(initialStep);

        // Dynamic Role Loading Logic
        function updateRoleCount() {
            const count = $('#roles-container .role-item').length;
            $('#role-count').text(count);
            if (count === 5) {
                $('#role-validation-msg').text('Perfect! 5 roles added.').removeClass('text-danger').addClass('text-success');
            } else {
                $('#role-validation-msg').text(`Need ${5 - count} more roles.`).removeClass('text-success').addClass('text-danger');
            }
        }

        $(document).on('click', '.add-role-btn', function() {
            const type = $('#role-type-selector').val();
            if (!type) return toastr.warning('Please select a role type');
            
            const count = $('#roles-container .role-item').length;
            if (count >= 5) return toastr.error('Maximum 5 roles allowed');

            $.get(`{{ route('admin.activity-games.get-role-form', $activity->id) }}?type=${type}&index=${count}`, function(html) {
                $('#roles-container').append(html);
                updateRoleCount();
                
                // Initialize summernote for dynamic strategy cards in the new role
                $('.summernote-simple').summernote({
                    height: 100,
                    toolbar: [['style', ['bold', 'underline']], ['para', ['ul', 'ol']]]
                });
                
                toastr.success(`${type.charAt(0).toUpperCase() + type.slice(1)} role added`);
            });
        });

        // Event listeners for dynamic items
        $(document).on('click', '.remove-item', function() {
            $(this).closest('.row, .border').fadeOut(300, function() {
                $(this).remove();
                updateRoleCount();
            });
        });

        // Add Timeline Item
        $('.add-timeline-item').click(function() {
            let index = $('#timeline-container .timeline-item').length;
            let html = `
                <div class="row timeline-item mb-2 animate__animated animate__fadeIn">
                    <div class="col-md-3">
                        <input type="text" name="timeline[${index}][time]" class="form-control" placeholder="10:00 PM">
                    </div>
                    <div class="col-md-8">
                        <input type="text" name="timeline[${index}][event]" class="form-control" placeholder="Event description">
                    </div>
                    <div class="col-md-1">
                        <button type="button" class="btn btn-outline-danger remove-item btn-block"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
            $('#timeline-container').append(html);
        });

        // Add Photo Item
        $('.add-photo-item').click(function() {
            let index = $('#photos-container .photo-item').length;
            if (index >= 5) return toastr.error('Max 5 photos allowed');
            let html = `
                <div class="row photo-item border p-3 mb-2 rounded bg-light animate__animated animate__fadeIn">
                    <div class="col-md-2">
                        <label>#</label>
                        <select name="photos[${index}][photo_number]" class="form-control">
                            ${[1,2,3,4,5].map(i => `<option value="${i}">${i}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-5">
                        <label>Label</label>
                        <input type="text" name="photos[${index}][label]" class="form-control" placeholder="Photo description">
                    </div>
                    <div class="col-md-4">
                        <label>Image</label>
                        <div class="custom-file">
                            <input type="file" name="photos[${index}][image]" class="custom-file-input">
                            <label class="custom-file-label">Choose photo</label>
                        </div>
                    </div>
                    <div class="col-md-1 text-right">
                        <label>&nbsp;</label><br>
                        <button type="button" class="btn btn-danger remove-item"><i class="fas fa-times"></i></button>
                    </div>
                </div>`;
            $('#photos-container').append(html);
            bsCustomFileInput.init();
        });

        // Investigator Card logic
        $('.add-investigator-card').click(function() {
            let index = $('#investigator-cards-container .investigator-card-item').length;
            if (index >= 4) return toastr.error('Max 4 investigator cards allowed');
            let html = `
                <div class="investigator-card-item border p-3 mb-2 rounded bg-light animate__animated animate__fadeIn">
                    <div class="row">
                        <div class="col-md-2">
                            <label>#</label>
                            <select name="investigator_cards[${index}][card_number]" class="form-control">
                                ${[1,2,3,4].map(i => `<option value="${i}">${i}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-5">
                            <label>Suspect Label</label>
                            <input type="text" name="investigator_cards[${index}][suspect_label]" class="form-control" placeholder="e.g. Suspect 1: Name">
                        </div>
                        <div class="col-md-5">
                            <label>Tag</label>
                            <input type="text" name="investigator_cards[${index}][tag]" class="form-control" placeholder="e.g. Primary Suspect">
                        </div>
                        <div class="col-md-12 mt-2">
                            <label>Profile Text</label>
                            <textarea name="investigator_cards[${index}][profile_text]" class="form-control" rows="2"></textarea>
                        </div>
                        <div class="col-md-5 mt-2">
                            <label>Appears (seconds)</label>
                            <input type="number" name="investigator_cards[${index}][appears_at_secs]" class="form-control">
                        </div>
                        <div class="col-md-5 mt-2">
                            <label>Closes (seconds)</label>
                            <input type="number" name="investigator_cards[${index}][closes_at_secs]" class="form-control">
                        </div>
                        <div class="col-md-2 mt-2 text-right">
                            <label>&nbsp;</label><br>
                            <button type="button" class="btn btn-outline-danger remove-item"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
            $('#investigator-cards-container').append(html);
        });

        // Add Rule Item
        $(document).on('click', '.add-rule-item', function() {
            let index = $('#rules-container .rule-item').length;
            let html = `
                <div class="row rule-item mb-2 animate__animated animate__fadeIn">
                    <div class="col-md-9">
                        <input type="text" name="rules[${index}][rule_text]" class="form-control" placeholder="Rule text">
                    </div>
                    <div class="col-md-2 px-0">
                        <input type="number" name="rules[${index}][order]" class="form-control" value="${index}">
                    </div>
                    <div class="col-md-1">
                        <button type="button" class="btn text-danger remove-item"><i class="fas fa-times"></i></button>
                    </div>
                </div>`;
            $('#rules-container').append(html);
        });

        // Add Story Item
        $(document).on('click', '.add-story-item', function() {
            let index = $('#story-container .story-item').length;
            if (index >= 3) return toastr.error('Max 3 story parts allowed');
            let html = `
                <div class="story-item border p-3 mb-2 rounded bg-light animate__animated animate__fadeIn">
                    <div class="row">
                        <div class="col-md-2">
                            <label>Part #</label>
                            <select name="full_story[${index}][part_number]" class="form-control">
                                ${[1,2,3].map(i => `<option value="${i}" ${i == (index+1) ? 'selected' : ''}>${i}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-9">
                            <label>Part Title</label>
                            <input type="text" name="full_story[${index}][part_title]" class="form-control" placeholder="e.g. The Truth Revealed">
                        </div>
                        <div class="col-md-1 text-right">
                            <label>&nbsp;</label><br>
                            <button type="button" class="btn btn-outline-danger remove-item"><i class="fas fa-trash"></i></button>
                        </div>
                        <div class="col-md-12 mt-2">
                            <label>Content</label>
                            <textarea name="full_story[${index}][part_body]" class="form-control summernote-dynamic"></textarea>
                        </div>
                    </div>
                </div>`;
            $('#story-container').append(html);
            
            // Initialize Summernote for dynamic textarea
            $('.summernote-dynamic').last().summernote({
                height: 200,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'underline', 'clear']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['view', ['fullscreen', 'codeview']]
                ]
            });
        });

        // Simple Repeater Logic (What You Know / Keep In Mind)
        $(document).on('click', '.add-simple-repeater', function() {
            const name = $(this).data('name');
            const container = $(this).closest('.card').find('.repeater-container');
            const html = `
                <div class="input-group input-group-sm mb-1 animate__animated animate__fadeIn">
                    <input type="text" name="${name}[]" class="form-control">
                    <div class="input-group-append">
                        <button type="button" class="btn btn-danger remove-repeater-item"><i class="fas fa-times"></i></button>
                    </div>
                </div>`;
            container.append(html);
        });

        $(document).on('click', '.remove-repeater-item', function() {
            $(this).closest('.input-group').remove();
        });

        // Nested Strategy Card Addition
        $(document).on('click', '.add-strategy-card', function() {
            const roleIndex = $(this).data('role-index');
            const container = $(`#strategy-cards-${roleIndex}`);
            const index = container.find('.strategy-card-item').length;
            if (index >= 4) return toastr.error('Max 4 strategy cards allowed');

            const html = `
                <div class="strategy-card-item border p-2 mb-2 bg-white rounded shadow-xs animate__animated animate__fadeIn">
                    <div class="row">
                        <div class="col-md-2">
                            <select name="roles[${roleIndex}][strategy_cards][${index}][card_number]" class="form-control form-control-sm">
                                ${[1,2,3,4].map(i => `<option value="${i}">#${i}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-7">
                            <input type="text" name="roles[${roleIndex}][strategy_cards][${index}][heading]" class="form-control form-control-sm" placeholder="Heading">
                        </div>
                        <div class="col-md-2 px-1">
                            <input type="color" name="roles[${roleIndex}][strategy_cards][${index}][heading_color]" class="form-control form-control-sm p-0" value="#7F77DD" style="height: 31px;">
                        </div>
                        <div class="col-md-1 text-right">
                            <button type="button" class="btn btn-xs btn-outline-danger remove-item"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="col-md-12 mt-2">
                            <textarea name="roles[${roleIndex}][strategy_cards][${index}][body_content]" class="form-control form-control-sm summernote-simple"></textarea>
                        </div>
                    </div>
                </div>`;
            container.append(html);
            
            // Initialize summernote for the new strategy card
            $('.summernote-simple').last().summernote({
                height: 100,
                toolbar: [['style', ['bold', 'underline']], ['para', ['ul', 'ol']]]
            });
        });

        updateRoleCount();
    });
</script>
@endsection
