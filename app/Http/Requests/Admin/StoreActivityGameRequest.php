<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivityGameRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $activity = $this->route('activity');

        if ($activity) {
            $this->merge([
                'activity_id' => $activity instanceof \App\Models\Activity ? $activity->id : $activity,
            ]);
        }

        // Drop entirely-empty repeater rows before validation so a blank trailing
        // row (e.g. the one the "Add Event" button leaves behind) never trips the
        // required rules. Only rows with no user input at all are removed — any row
        // the user actually filled in is kept and still validated.
        $this->stripEmptyRows();
    }

    /**
     * Remove fully-empty repeater rows (timeline, photos, rules, clues,
     * investigator cards, full story) and re-index them so the remaining rows
     * are validated under consecutive keys.
     */
    protected function stripEmptyRows(): void
    {
        $clean = [];

        // Original array keys are preserved throughout: the controller pairs each
        // uploaded file to its row by key (e.g. hasFile("photos.$index.image")), so
        // re-indexing here would break that pairing. Empty rows have no file anyway.

        // Timeline: a row counts as empty when both time and event are blank.
        if (is_array($timeline = $this->input('timeline'))) {
            $clean['timeline'] = array_filter($timeline, function ($row) {
                return is_array($row)
                    && (trim((string) ($row['time'] ?? '')) !== '' || trim((string) ($row['event'] ?? '')) !== '');
            });
        }

        // Photos: empty when there is no label, no new upload and no existing image.
        if (is_array($photos = $this->input('photos'))) {
            $filtered = [];
            foreach ($photos as $i => $row) {
                if (!is_array($row)) {
                    continue;
                }
                $hasLabel = trim((string) ($row['label'] ?? '')) !== '';
                $hasExisting = trim((string) ($row['existing_image'] ?? '')) !== '';
                if ($hasLabel || $hasExisting || $this->hasFile("photos.$i.image")) {
                    $filtered[$i] = $row;
                }
            }
            $clean['photos'] = $filtered;
        }

        // Rules: empty when the rule text is blank.
        if (is_array($rules = $this->input('rules'))) {
            $clean['rules'] = array_filter($rules, function ($row) {
                return is_array($row) && trim((string) ($row['rule_text'] ?? '')) !== '';
            });
        }

        // Clue room: a single optional block — drop it when nothing was entered.
        if (is_array($clues = $this->input('clues'))) {
            $filtered = [];
            foreach ($clues as $i => $row) {
                if (!is_array($row)) {
                    continue;
                }
                $filled = trim((string) ($row['clue_title'] ?? '')) !== ''
                    || trim((string) ($row['clue_short_description'] ?? '')) !== ''
                    || trim(strip_tags((string) ($row['clue_detail'] ?? ''))) !== ''
                    || trim((string) ($row['existing_image'] ?? '')) !== ''
                    || $this->hasFile("clues.$i.clue_image");
                if ($filled) {
                    $filtered[$i] = $row;
                }
            }
            $clean['clues'] = $filtered;
        }

        // Investigator cards: drop a card with no label and no profile text.
        if (is_array($cards = $this->input('investigator_cards'))) {
            $filtered = [];
            foreach ($cards as $i => $row) {
                if (!is_array($row)) {
                    continue;
                }
                $filled = trim((string) ($row['suspect_label'] ?? '')) !== ''
                    || trim((string) ($row['tag'] ?? '')) !== ''
                    || trim(strip_tags((string) ($row['profile_text'] ?? ''))) !== '';
                if ($filled) {
                    $filtered[$i] = $row;
                }
            }
            $clean['investigator_cards'] = $filtered;
        }

        // Full story parts: drop a part with no title, body or image.
        if (is_array($stories = $this->input('full_story'))) {
            $filtered = [];
            foreach ($stories as $i => $row) {
                if (!is_array($row)) {
                    continue;
                }
                $filled = trim((string) ($row['part_title'] ?? '')) !== ''
                    || trim(strip_tags((string) ($row['part_body'] ?? ''))) !== ''
                    || trim((string) ($row['existing_image'] ?? '')) !== ''
                    || $this->hasFile("full_story.$i.part_image");
                if ($filled) {
                    $filtered[$i] = $row;
                }
            }
            $clean['full_story'] = $filtered;
        }

        if (!empty($clean)) {
            $this->merge($clean);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'activity_id' => 'required|exists:activities,id',
            'title' => 'required|string|max:150',
            'case_summary' => 'required|string',
            'tagline' => 'required|string|max:255',
            // Required to upload on create; in edit an already-saved background
            // (carried in existing_bg_image) satisfies it without re-uploading.
            'bg_image' => 'required_without:existing_bg_image|image|mimes:jpeg,jpg,png,webp|max:4096',
            'existing_bg_image' => 'nullable|string',
            'case_summary_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:4096',
            'culprit_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
            'status' => 'required|in:draft,active',

            'wizard_step' => 'nullable|integer|min:1|max:4',

            'timeline' => 'nullable|array',
            'timeline.*.time' => 'required_with:timeline|string|max:50',
            'timeline.*.event' => 'required_with:timeline|string|max:255',

            'quick_facts' => 'nullable|array',
            'quick_facts.location' => 'nullable|string|max:150',
            'quick_facts.date_time' => 'nullable|string|max:150',
            'quick_facts.weather' => 'nullable|string|max:150',
            'quick_facts.cctv_status' => 'nullable|string|max:150',

            'photos' => 'nullable|array|max:5',
            'photos.*.photo_number' => 'required|integer|min:1|max:5',
            'photos.*.label' => 'required|string|max:150',
            'photos.*.image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',

            'roles' => 'required|array|size:5',
            'roles.*.role_type' => 'required|string|distinct',
            'roles.*.character_name' => 'required|string|max:150',
            'roles.*.subtitle' => 'nullable|string|max:255',
            'roles.*.objective' => 'nullable|string',
            'roles.*.footer_text' => 'nullable|string|max:255',
            'roles.*.role_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:100',
            // Small badge shown on the player's own role card — displayed at 60×60.
            'roles.*.role_icon' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:100',
            'roles.*.what_you_know' => 'nullable|array',
            'roles.*.what_you_know.*' => 'nullable|string|max:255',
            'roles.*.keep_in_mind' => 'nullable|array',
            'roles.*.keep_in_mind.*' => 'nullable|string|max:255',
            'roles.*.strategy_cards' => 'nullable|array|max:4',
            'roles.*.strategy_cards.*.card_number' => 'required_with:roles.*.strategy_cards|integer|min:1|max:4',
            'roles.*.strategy_cards.*.heading' => 'nullable|string|max:150',
            'roles.*.strategy_cards.*.heading_color' => 'nullable|string|max:20',
            'roles.*.strategy_cards.*.body_content' => 'nullable|string',

            'investigator_cards' => 'nullable|array|max:4',
            'investigator_cards.*.card_number' => 'required|integer|min:1|max:4',
            'investigator_cards.*.suspect_label' => 'required|string|max:150',
            'investigator_cards.*.tag' => 'nullable|string|max:150',
            'investigator_cards.*.profile_text' => 'nullable|string',
            'investigator_cards.*.appears_at_secs' => 'required|integer|min:0',
            'investigator_cards.*.closes_at_secs' => 'required|integer|gt:investigator_cards.*.appears_at_secs',

            'clues' => 'nullable|array|max:1',
            'clues.*.clue_title' => 'required|string|max:150',
            'clues.*.clue_short_description' => 'nullable|string|max:255',
            'clues.*.clue_detail' => 'nullable|string',
            'clues.*.clue_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',

            'rules' => 'nullable|array',
            'rules.*.rule_text' => 'required|string|max:255',
            'rules.*.order' => 'nullable|integer|min:0',

            'full_story' => 'required|array|min:1|max:3',
            'full_story.*.part_number' => 'required|integer|min:1|max:3',
            'full_story.*.part_title' => 'required|string|max:150',
            'full_story.*.part_body' => 'required|string',
            'full_story.*.part_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
        ];
    }

    /**
     * Clear, human-friendly image messages (size spelled out as MB, plus the
     * accepted formats) so the wizard never fails silently on an oversized or
     * wrong-type upload.
     */
    public function messages(): array
    {
        return [
            'bg_image.image' => 'The case background must be a valid image file.',
            'bg_image.mimes' => 'The case background must be a JPG, PNG, WEBP or JPEG file.',
            'bg_image.max'   => 'The case background image may not be larger than 4 MB.',
            'bg_image.uploaded' => 'The case background image failed to upload — it is probably larger than the server allows. Please choose a smaller image.',
            'case_summary_image.image' => 'The case summary image must be a valid image file.',
            'case_summary_image.mimes' => 'The case summary image must be a JPG, PNG, WEBP or JPEG file.',
            'case_summary_image.max'   => 'The case summary image may not be larger than 4 MB.',
            'case_summary_image.uploaded' => 'The case summary image failed to upload — it is probably larger than the server allows. Please choose a smaller image.',

            'culprit_image.image' => 'The culprit reveal image must be a valid image file.',
            'culprit_image.mimes' => 'The culprit reveal image must be a JPG, PNG, WEBP or JPEG file.',
            'culprit_image.max'   => 'The culprit reveal image may not be larger than 2 MB.',
            'culprit_image.uploaded' => 'The culprit reveal image failed to upload — it is probably larger than the server allows. Please choose a smaller image.',

            'photos.*.image.image' => 'Each investigation photo must be a valid image file.',
            'photos.*.image.mimes' => 'Each investigation photo must be a JPG, PNG, WEBP or JPEG file.',
            'photos.*.image.max'   => 'Each investigation photo may not be larger than 2 MB.',
            'photos.*.image.uploaded' => 'An investigation photo failed to upload — it is probably larger than the server allows. Please choose a smaller image.',

            'roles.*.role_image.image' => 'Each role image must be a valid image file.',
            'roles.*.role_image.mimes' => 'Each role image must be a JPG, PNG, WEBP or JPEG file.',
            'roles.*.role_image.max'   => 'Each role image may not be larger than 100 KB.',
            'roles.*.role_image.uploaded' => 'A role image failed to upload — it is probably larger than the server allows. Please choose a smaller image.',

            'roles.*.role_icon.image' => 'Each role icon must be a valid image file.',
            'roles.*.role_icon.mimes' => 'Each role icon must be a JPG, PNG, WEBP or JPEG file.',
            'roles.*.role_icon.max'   => 'Each role icon may not be larger than 100 KB.',
            'roles.*.role_icon.uploaded' => 'A role icon failed to upload — it is probably larger than the server allows. Please choose a smaller image.',

            'clues.*.clue_image.image' => 'The clue image must be a valid image file.',
            'clues.*.clue_image.mimes' => 'The clue image must be a JPG, PNG, WEBP or JPEG file.',
            'clues.*.clue_image.max'   => 'The clue image may not be larger than 2 MB.',
            'clues.*.clue_image.uploaded' => 'The clue image failed to upload — it is probably larger than the server allows. Please choose a smaller image.',

            'full_story.*.part_image.image' => 'Each story image must be a valid image file.',
            'full_story.*.part_image.mimes' => 'Each story image must be a JPG, PNG, WEBP or JPEG file.',
            'full_story.*.part_image.max'   => 'Each story image may not be larger than 2 MB.',
            'full_story.*.part_image.uploaded' => 'A story image failed to upload — it is probably larger than the server allows. Please choose a smaller image.',

            // Human-friendly messages for the required/length rules so the summary
            // never shows raw keys like "timeline.0.time field is required".
            'title.required' => 'Please enter a game title.',
            'title.max' => 'The game title may not be longer than 150 characters.',
            'case_summary.required' => 'Please enter the case summary.',
            'tagline.required' => 'Please enter a results page tagline.',
            'tagline.max' => 'The tagline may not be longer than 255 characters.',
            'bg_image.required_without' => 'Please upload a case background image.',
            'full_story.required' => 'Please add at least one Full Story Reveal part.',
            'full_story.min' => 'Please add at least one Full Story Reveal part.',
            'status.required' => 'Please choose a status.',

            'timeline.*.time.required_with' => 'Every timeline event needs a time.',
            'timeline.*.time.max' => 'A timeline time may not be longer than 50 characters.',
            'timeline.*.event.required_with' => 'Every timeline event needs a description.',
            'timeline.*.event.max' => 'A timeline event description may not be longer than 255 characters.',

            'photos.*.label.required' => 'Every investigation photo needs a label.',
            'photos.*.label.max' => 'A photo label may not be longer than 150 characters.',

            'roles.required' => 'Please add all 5 game roles.',
            'roles.size' => 'Exactly 5 game roles are required.',
            'roles.*.role_type.required' => 'Each role needs a role type.',
            'roles.*.role_type.distinct' => 'Each of the 5 roles must be a different role type.',
            'roles.*.character_name.required' => 'Each role needs a character name.',
            'roles.*.character_name.max' => 'A character name may not be longer than 150 characters.',
            'roles.*.subtitle.max' => 'A role subtitle may not be longer than 255 characters.',
            'roles.*.footer_text.max' => 'A role footer may not be longer than 255 characters.',

            'investigator_cards.*.suspect_label.required' => 'Each investigator card needs a suspect label.',
            'investigator_cards.*.appears_at_secs.required' => 'Each investigator card needs an "appears at" time.',
            'investigator_cards.*.closes_at_secs.required' => 'Each investigator card needs a "closes at" time.',
            'investigator_cards.*.closes_at_secs.gt' => 'An investigator card must close after it appears.',

            'clues.*.clue_title.required' => 'The clue needs a title.',

            'rules.*.rule_text.required' => 'Each rule needs some text.',
            'rules.*.rule_text.max' => 'A rule may not be longer than 255 characters.',

            'full_story.*.part_title.required' => 'Each story part needs a title.',
            'full_story.*.part_title.max' => 'A story part title may not be longer than 150 characters.',
            'full_story.*.part_body.required' => 'Each story part needs some content.',
        ];
    }

    /**
     * Readable field names so any rule we did not message explicitly (e.g. a plain
     * max) still reads as "The game title ..." rather than a raw array key.
     */
    public function attributes(): array
    {
        return [
            'title' => 'game title',
            'case_summary' => 'case summary',
            'tagline' => 'tagline',
            'status' => 'status',
            'timeline.*.time' => 'timeline time',
            'timeline.*.event' => 'timeline event',
            'photos.*.label' => 'photo label',
            'photos.*.photo_number' => 'photo number',
            'roles.*.role_type' => 'role type',
            'roles.*.character_name' => 'character name',
            'roles.*.subtitle' => 'role subtitle',
            'roles.*.footer_text' => 'role footer',
            'investigator_cards.*.suspect_label' => 'suspect label',
            'investigator_cards.*.appears_at_secs' => 'investigator card "appears at" time',
            'investigator_cards.*.closes_at_secs' => 'investigator card "closes at" time',
            'clues.*.clue_title' => 'clue title',
            'rules.*.rule_text' => 'rule text',
            'full_story.*.part_title' => 'story part title',
            'full_story.*.part_body' => 'story part content',
        ];
    }
}

