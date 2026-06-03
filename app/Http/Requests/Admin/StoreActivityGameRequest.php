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
            'tagline' => 'nullable|string|max:255',
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
            'photos.*.image' => 'nullable|image|max:2048',

            'roles' => 'required|array|size:5',
            'roles.*.role_type' => 'required|string|distinct',
            'roles.*.character_name' => 'required|string|max:150',
            'roles.*.subtitle' => 'nullable|string|max:255',
            'roles.*.objective' => 'nullable|string',
            'roles.*.footer_text' => 'nullable|string|max:255',
            'roles.*.role_image' => 'nullable|image|max:2048',
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
            'clues.*.clue_image' => 'nullable|image|max:2048',

            'rules' => 'nullable|array',
            'rules.*.rule_text' => 'required|string|max:255',
            'rules.*.order' => 'nullable|integer|min:0',

            'full_story' => 'nullable|array|max:3',
            'full_story.*.part_number' => 'required|integer|min:1|max:3',
            'full_story.*.part_title' => 'required|string|max:150',
            'full_story.*.part_body' => 'required|string',
        ];
    }
}

