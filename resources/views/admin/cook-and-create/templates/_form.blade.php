@csrf
@if ($mode === 'edit')
    @method('PUT')
@endif

<h5 class="mb-3">Basics</h5>

<div class="form-row">
    <div class="form-group col-md-8">
        <label>Name <span class="text-danger">*</span></label>
        <input type="text" name="name" class="form-control @error('name') is-invalid @enderror"
               value="{{ old('name', $template->name ?? '') }}" required>
        @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
    <div class="form-group col-md-4">
        <label>Status <span class="text-danger">*</span></label>
        <select name="status" class="form-control @error('status') is-invalid @enderror" required>
            @foreach (['active' => 'Active', 'draft' => 'Draft'] as $value => $label)
                <option value="{{ $value }}" {{ old('status', $template->status ?? 'active') === $value ? 'selected' : '' }}>{{ $label }}</option>
            @endforeach
        </select>
        @error('status') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
</div>

<div class="form-group">
    <label>Activity Game <span class="text-danger">*</span></label>
    <select name="activity_game_id" class="form-control @error('activity_game_id') is-invalid @enderror" required>
        <option value="">— Select —</option>
        @foreach ($activityGames as $game)
            <option value="{{ $game->id }}" {{ (string) old('activity_game_id', $template->activity_game_id ?? '') === (string) $game->id ? 'selected' : '' }}>
                {{ $game->title }} — {{ $game->activity->title ?? 'Unknown activity' }} (#{{ $game->id }})
            </option>
        @endforeach
    </select>
    @error('activity_game_id') <div class="invalid-feedback">{{ $message }}</div> @enderror
</div>

<div class="form-group">
    <label>Tagline</label>
    <input type="text" name="tagline" class="form-control @error('tagline') is-invalid @enderror"
           value="{{ old('tagline', $template->tagline ?? '') }}" maxlength="255">
    @error('tagline') <div class="invalid-feedback">{{ $message }}</div> @enderror
</div>

<div class="form-group">
    <label>Description <span class="text-muted">(shown on the Challenge Brief screen — HTML allowed)</span></label>
    <textarea name="description" rows="3" class="form-control @error('description') is-invalid @enderror">{{ old('description', $template->description ?? '') }}</textarea>
    @error('description') <div class="invalid-feedback">{{ $message }}</div> @enderror
</div>

<div class="form-group">
    <label>Challenge Brief background image <span class="text-muted">(shown behind the pre-Round-1 screen — falls back to the default kitchen art if not set)</span></label>
    <input type="file" name="background_image" class="form-control-file @error('background_image') is-invalid @enderror" accept="image/*">
    @error('background_image') <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
    @if (!empty($template) && $template->background_image)
        <div class="mt-2">
            <img src="{{ asset('storage/' . ltrim($template->background_image, '/')) }}" alt="" style="max-width:280px; max-height:120px; object-fit:cover; border-radius:8px;">
        </div>
    @endif
</div>

<div class="form-group">
    <label>Character portraits <span class="text-muted">(shown on the pre-Round-1 and voting screens — any left blank fall back to the default art)</span></label>
    <div class="form-row">
        @foreach ([
            'chef1_image' => 'Chef 1',
            'chef2_image' => 'Chef 2',
            'chef3_image' => 'Chef 3',
            'chef4_image' => 'Chef 4',
            'show_host_image' => 'Show Host',
        ] as $field => $label)
            <div class="form-group col-md-2 col-4">
                <label class="small">{{ $label }}</label>
                <input type="file" name="{{ $field }}" class="form-control-file @error($field) is-invalid @enderror" accept="image/*">
                @error($field) <div class="invalid-feedback d-block">{{ $message }}</div> @enderror
                @if (!empty($template) && $template->{$field})
                    <img src="{{ asset('storage/' . ltrim($template->{$field}, '/')) }}" alt="{{ $label }}" class="mt-2 d-block" style="width:100%; max-width:90px; aspect-ratio:3/4; object-fit:cover; border-radius:8px;">
                @endif
            </div>
        @endforeach
    </div>
</div>

<hr>
<h5 class="mb-3">Round 1 — Ingredient Market</h5>
<div class="form-row">
    <div class="form-group col-md-4">
        <label>Votes per player <span class="text-danger">*</span></label>
        <input type="number" name="round1_votes_per_player" min="1" max="5" class="form-control @error('round1_votes_per_player') is-invalid @enderror"
               value="{{ old('round1_votes_per_player', $template->round1_votes_per_player ?? 2) }}" required>
        @error('round1_votes_per_player') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
    <div class="form-group col-md-4">
        <label>Top ingredients selected <span class="text-danger">*</span></label>
        <input type="number" name="round1_top_ingredients" min="2" max="10" class="form-control @error('round1_top_ingredients') is-invalid @enderror"
               value="{{ old('round1_top_ingredients', $template->round1_top_ingredients ?? 4) }}" required>
        @error('round1_top_ingredients') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
    <div class="form-group col-md-4">
        <label>Voting timer (secs) <span class="text-danger">*</span></label>
        <input type="number" name="round1_timer_secs" min="15" class="form-control @error('round1_timer_secs') is-invalid @enderror"
               value="{{ old('round1_timer_secs', $template->round1_timer_secs ?? 120) }}" required>
        @error('round1_timer_secs') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
</div>

<div class="form-group">
    <label>Ingredient pool <span class="text-danger">*</span> <span class="text-muted">(at least 4 — mark a couple as "Absurd" on the Ingredients tab for red herrings)</span></label>
    <div class="border rounded p-3" style="max-height:220px; overflow-y:auto;">
        @forelse ($ingredients as $ingredient)
            <div class="form-check form-check-inline" style="width:180px;">
                <input class="form-check-input" type="checkbox" name="ingredient_ids[]" value="{{ $ingredient->id }}"
                       id="ing-{{ $ingredient->id }}"
                       {{ in_array($ingredient->id, old('ingredient_ids', $selectedIngredientIds ?? [])) ? 'checked' : '' }}>
                <label class="form-check-label" for="ing-{{ $ingredient->id }}">
                    {{ $ingredient->name }}{{ $ingredient->is_absurd ? ' 🎭' : '' }}
                </label>
            </div>
        @empty
            <p class="text-muted mb-0">No ingredients yet — add some on the Ingredients tab first.</p>
        @endforelse
    </div>
    @error('ingredient_ids') <div class="text-danger small mt-1">{{ $message }}</div> @enderror
</div>

<hr>
<h5 class="mb-3">Round 2 — Cooking Steps</h5>
<div class="form-row">
    <div class="form-group col-md-3">
        <label>Step max characters <span class="text-danger">*</span></label>
        <input type="number" name="round2_step_max_chars" min="20" max="500" class="form-control @error('round2_step_max_chars') is-invalid @enderror"
               value="{{ old('round2_step_max_chars', $template->round2_step_max_chars ?? 120) }}" required>
        @error('round2_step_max_chars') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
    <div class="form-group col-md-3">
        <label>Per-player turn (secs) <span class="text-danger">*</span></label>
        <input type="number" name="round2_submit_timer_secs" min="15" class="form-control @error('round2_submit_timer_secs') is-invalid @enderror"
               value="{{ old('round2_submit_timer_secs', $template->round2_submit_timer_secs ?? 60) }}" required>
        <small class="form-text text-muted">Round 2 is turn-based — each player gets this long to write their step (60 = 1 minute).</small>
        @error('round2_submit_timer_secs') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
    <div class="form-group col-md-3">
        <label>Review timer (secs) <span class="text-danger">*</span></label>
        <input type="number" name="round2_review_timer_secs" min="15" class="form-control @error('round2_review_timer_secs') is-invalid @enderror"
               value="{{ old('round2_review_timer_secs', $template->round2_review_timer_secs ?? 120) }}" required>
        @error('round2_review_timer_secs') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
    <div class="form-group col-md-3">
        <label class="d-block">Show Host role</label>
        <div class="form-check mt-2">
            <input type="checkbox" name="show_host_role_enabled" id="show_host_role_enabled" class="form-check-input" value="1"
                   {{ old('show_host_role_enabled', $template->show_host_role_enabled ?? true) ? 'checked' : '' }}>
            <label class="form-check-label" for="show_host_role_enabled">Enabled (only the Show Host may name the dish)</label>
        </div>
    </div>
</div>

<hr>
<h5 class="mb-3">Round 3 — The Kitchen Talks</h5>
<div class="form-row">
    <div class="form-group col-md-4">
        <label>Discussion timer (secs) <span class="text-danger">*</span></label>
        <input type="number" name="round3_discussion_timer_secs" min="15" class="form-control @error('round3_discussion_timer_secs') is-invalid @enderror"
               value="{{ old('round3_discussion_timer_secs', $template->round3_discussion_timer_secs ?? 60) }}" required>
        @error('round3_discussion_timer_secs') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
    <div class="form-group col-md-4">
        <label>Voting timer (secs) <span class="text-danger">*</span></label>
        <input type="number" name="round3_voting_timer_secs" min="15" class="form-control @error('round3_voting_timer_secs') is-invalid @enderror"
               value="{{ old('round3_voting_timer_secs', $template->round3_voting_timer_secs ?? 120) }}" required>
        @error('round3_voting_timer_secs') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
    <div class="form-group col-md-4">
        <label>Max messages per player <span class="text-danger">*</span></label>
        <input type="number" name="round3_max_messages_per_player" min="1" max="20" class="form-control @error('round3_max_messages_per_player') is-invalid @enderror"
               value="{{ old('round3_max_messages_per_player', $template->round3_max_messages_per_player ?? 2) }}" required>
        @error('round3_max_messages_per_player') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>
</div>

<div class="form-group">
    <label>Impostor bias card <span class="text-muted">(shown only to the impostor — HTML allowed)</span></label>
    <textarea name="impostor_bias_card_text" rows="4" class="form-control @error('impostor_bias_card_text') is-invalid @enderror">{{ old('impostor_bias_card_text', $template->impostor_bias_card_text ?? '') }}</textarea>
    @error('impostor_bias_card_text') <div class="invalid-feedback">{{ $message }}</div> @enderror
</div>

<hr>
<h5 class="mb-3">Clues <span class="text-muted small">(hints revealed as the game progresses — grouped by round)</span></h5>

@php
    $oldClues = old('clues', isset($template) ? $template->clues->map(fn ($c) => ['round_number' => $c->round_number, 'clue_text' => $c->clue_text])->all() : []);
@endphp

<div id="clues-wrapper">
    @forelse ($oldClues as $i => $clue)
        <div class="form-row align-items-end clue-row mb-2">
            <div class="form-group col-md-2">
                <label>Round</label>
                <select name="clues[{{ $i }}][round_number]" class="form-control">
                    @foreach ([1, 2, 3] as $r)
                        <option value="{{ $r }}" {{ (int) ($clue['round_number'] ?? 1) === $r ? 'selected' : '' }}>Round {{ $r }}</option>
                    @endforeach
                </select>
            </div>
            <div class="form-group col-md-9">
                <label>Clue text</label>
                <input type="text" name="clues[{{ $i }}][clue_text]" class="form-control" value="{{ $clue['clue_text'] ?? '' }}">
            </div>
            <div class="form-group col-md-1">
                <button type="button" class="btn btn-outline-danger remove-clue-row"><i class="fas fa-times"></i></button>
            </div>
        </div>
    @empty
    @endforelse
</div>
<button type="button" id="add-clue-row" class="btn btn-outline-secondary btn-sm mb-4">
    <i class="fas fa-plus"></i> Add Clue
</button>

<template id="clue-row-template">
    <div class="form-row align-items-end clue-row mb-2">
        <div class="form-group col-md-2">
            <label>Round</label>
            <select name="clues[__INDEX__][round_number]" class="form-control">
                <option value="1">Round 1</option>
                <option value="2">Round 2</option>
                <option value="3">Round 3</option>
            </select>
        </div>
        <div class="form-group col-md-9">
            <label>Clue text</label>
            <input type="text" name="clues[__INDEX__][clue_text]" class="form-control">
        </div>
        <div class="form-group col-md-1">
            <button type="button" class="btn btn-outline-danger remove-clue-row"><i class="fas fa-times"></i></button>
        </div>
    </div>
</template>

<hr>
<h5 class="mb-3">Game Rules <span class="text-muted small">(shown on the participant lobby screen, in this order)</span></h5>

@php
    $oldRules = old('game_rules', isset($template) ? $template->rules->map(fn ($r) => ['rule_text' => $r->rule_text])->all() : []);
@endphp

<div id="rules-wrapper">
    @forelse ($oldRules as $i => $rule)
        <div class="form-row align-items-end rule-row mb-2">
            <div class="form-group col-md-11">
                <label>Rule</label>
                <input type="text" name="game_rules[{{ $i }}][rule_text]" class="form-control" value="{{ $rule['rule_text'] ?? '' }}">
            </div>
            <div class="form-group col-md-1">
                <button type="button" class="btn btn-outline-danger remove-rule-row"><i class="fas fa-times"></i></button>
            </div>
        </div>
    @empty
    @endforelse
</div>
<button type="button" id="add-rule-row" class="btn btn-outline-secondary btn-sm mb-4">
    <i class="fas fa-plus"></i> Add Rule
</button>

<template id="rule-row-template">
    <div class="form-row align-items-end rule-row mb-2">
        <div class="form-group col-md-11">
            <label>Rule</label>
            <input type="text" name="game_rules[__INDEX__][rule_text]" class="form-control">
        </div>
        <div class="form-group col-md-1">
            <button type="button" class="btn btn-outline-danger remove-rule-row"><i class="fas fa-times"></i></button>
        </div>
    </div>
</template>

<script>
(function () {
    var wrapper = document.getElementById('rules-wrapper');
    var addBtn = document.getElementById('add-rule-row');
    var tpl = document.getElementById('rule-row-template');
    var nextIndex = wrapper.querySelectorAll('.rule-row').length;

    addBtn.addEventListener('click', function () {
        var html = tpl.innerHTML.replace(/__INDEX__/g, nextIndex++);
        var div = document.createElement('div');
        div.innerHTML = html.trim();
        wrapper.appendChild(div.firstChild);
    });

    wrapper.addEventListener('click', function (e) {
        var btn = e.target.closest('.remove-rule-row');
        if (btn) {
            btn.closest('.rule-row').remove();
        }
    });
})();
</script>

<div>
    <button type="submit" class="btn btn-primary">
        <i class="fas fa-save"></i> {{ $mode === 'edit' ? 'Update' : 'Create' }} Template
    </button>
    <a href="{{ route('admin.cook-and-create.templates.index') }}" class="btn btn-secondary">Cancel</a>
</div>

{{-- Inline (not @push/@section footer_js) — this partial is @included from
     create/edit, and the layout uses @yield('footer_js'), which only pulls
     from @section/@show, not @push. A plain inline script tag placed after
     the elements it references works regardless of where it's included. --}}
<script>
(function () {
    var wrapper = document.getElementById('clues-wrapper');
    var addBtn = document.getElementById('add-clue-row');
    var tpl = document.getElementById('clue-row-template');
    var nextIndex = wrapper.querySelectorAll('.clue-row').length;

    addBtn.addEventListener('click', function () {
        var html = tpl.innerHTML.replace(/__INDEX__/g, nextIndex++);
        var div = document.createElement('div');
        div.innerHTML = html.trim();
        wrapper.appendChild(div.firstChild);
    });

    wrapper.addEventListener('click', function (e) {
        var btn = e.target.closest('.remove-clue-row');
        if (btn) {
            btn.closest('.clue-row').remove();
        }
    });
})();
</script>
