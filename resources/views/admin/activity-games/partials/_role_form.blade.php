@php $type = $type ?? ''; @endphp

<div class="role-item border p-4 mb-4 bg-light rounded shadow-sm animate__animated animate__fadeIn">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0 text-primary font-weight-bold">
            <i class="fas fa-user-tag mr-2"></i> Role: <span class="role-type-label text-uppercase">{{ $role->role_type ?? $type }}</span>
        </h5>
        <button type="button" class="btn btn-sm btn-outline-danger remove-item"><i class="fas fa-trash mr-1"></i> Remove Role</button>
    </div>
    
    <input type="hidden" name="roles[{{ $i }}][role_type]" value="{{ $role->role_type ?? $type }}">
    
    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label>Character Name <span class="text-danger">*</span></label>
                <input type="text" name="roles[{{ $i }}][character_name]" class="form-control" value="{{ old("roles.$i.character_name", $role->character_name ?? '') }}" placeholder="e.g. Detective Stark" required>
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label>Subtitle</label>
                <input type="text" name="roles[{{ $i }}][subtitle]" class="form-control" value="{{ old("roles.$i.subtitle", $role->subtitle ?? '') }}" placeholder="e.g. Lead Investigator">
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label>Role Image</label>
                <div class="custom-file">
                    <input type="file" name="roles[{{ $i }}][role_image]" class="custom-file-input">
                    <label class="custom-file-label">Choose character image</label>
                </div>
                @if(isset($role->role_image) && $role->role_image)
                    <input type="hidden" name="roles[{{ $i }}][existing_image]" value="{{ $role->role_image }}">
                    <img src="{{ asset('storage/' . $role->role_image) }}" class="mt-2 img-thumbnail" style="height:60px;">
                @endif
            </div>
        </div>
        <div class="col-md-6">
            <div class="form-group">
                <label>Footer Text</label>
                <input type="text" name="roles[{{ $i }}][footer_text]" class="form-control" value="{{ old("roles.$i.footer_text", $role->footer_text ?? '') }}" placeholder="Small note at the bottom">
            </div>
        </div>
        <div class="col-md-12">
            <div class="form-group">
                <label>Objective</label>
                <textarea name="roles[{{ $i }}][objective]" class="form-control" rows="2" placeholder="What is this character's main goal?">{{ old("roles.$i.objective", $role->objective ?? '') }}</textarea>
            </div>
        </div>
    </div>

    <!-- What You Know & Keep In Mind -->
    <div class="row mt-3">
        <div class="col-md-6">
            <div class="card card-outline card-secondary mb-0">
                <div class="card-header py-2">
                    <h3 class="card-title text-sm font-weight-bold">What You Know</h3>
                    <div class="card-tools">
                        <button type="button" class="btn btn-xs btn-primary add-simple-repeater" data-name="roles[{{ $i }}][what_you_know]"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="card-body p-2 repeater-container">
                    @php $know = old("roles.$i.what_you_know", $role->what_you_know ?? []); @endphp
                    @foreach($know as $kIndex => $val)
                        <div class="input-group input-group-sm mb-1">
                            <input type="text" name="roles[{{ $i }}][what_you_know][]" class="form-control" value="{{ $val }}">
                            <div class="input-group-append">
                                <button type="button" class="btn btn-danger remove-repeater-item"><i class="fas fa-times"></i></button>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card card-outline card-secondary mb-0">
                <div class="card-header py-2">
                    <h3 class="card-title text-sm font-weight-bold">Keep In Mind</h3>
                    <div class="card-tools">
                        <button type="button" class="btn btn-xs btn-primary add-simple-repeater" data-name="roles[{{ $i }}][keep_in_mind]"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="card-body p-2 repeater-container">
                    @php $mind = old("roles.$i.keep_in_mind", $role->keep_in_mind ?? []); @endphp
                    @foreach($mind as $mIndex => $val)
                        <div class="input-group input-group-sm mb-1">
                            <input type="text" name="roles[{{ $i }}][keep_in_mind][]" class="form-control" value="{{ $val }}">
                            <div class="input-group-append">
                                <button type="button" class="btn btn-danger remove-repeater-item"><i class="fas fa-times"></i></button>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <!-- Nested Strategy Cards -->
    <div class="card card-outline card-info mt-4">
        <div class="card-header py-2">
            <h3 class="card-title text-sm"><i class="fas fa-lightbulb mr-1"></i> Strategy Cards (Max 4)</h3>
            <div class="card-tools">
                <button type="button" class="btn btn-xs btn-info add-strategy-card" data-role-index="{{ $i }}"><i class="fas fa-plus mr-1"></i> Add Strategy</button>
            </div>
        </div>
        <div class="card-body p-2 strategy-cards-container" id="strategy-cards-{{ $i }}">
            @php $strategyCards = old("roles.$i.strategy_cards", isset($role->strategyCards) ? $role->strategyCards : []); @endphp
            @foreach($strategyCards as $sIndex => $sCard)
                <div class="strategy-card-item border p-2 mb-2 bg-white rounded shadow-xs">
                    <div class="row">
                        <div class="col-md-2">
                            <select name="roles[{{ $i }}][strategy_cards][{{ $sIndex }}][card_number]" class="form-control form-control-sm">
                                @for($cn=1; $cn<=4; $cn++)
                                    <option value="{{ $cn }}" {{ ($sCard['card_number'] ?? $sCard->card_number ?? '') == $cn ? 'selected' : '' }}>#{{ $cn }}</option>
                                @endfor
                            </select>
                        </div>
                        <div class="col-md-7">
                            <input type="text" name="roles[{{ $i }}][strategy_cards][{{ $sIndex }}][heading]" class="form-control form-control-sm" value="{{ $sCard['heading'] ?? $sCard->heading ?? '' }}" placeholder="Heading">
                        </div>
                        <div class="col-md-2 px-1">
                            <input type="color" name="roles[{{ $i }}][strategy_cards][{{ $sIndex }}][heading_color]" class="form-control form-control-sm p-0" value="{{ $sCard['heading_color'] ?? $sCard->heading_color ?? '#7F77DD' }}" style="height: 31px;">
                        </div>
                        <div class="col-md-1 text-right">
                            <button type="button" class="btn btn-xs btn-outline-danger remove-item"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="col-md-12 mt-2">
                            <textarea name="roles[{{ $i }}][strategy_cards][{{ $sIndex }}][body_content]" class="form-control form-control-sm summernote-simple">{{ $sCard['body_content'] ?? $sCard->body_content ?? '' }}</textarea>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</div>
