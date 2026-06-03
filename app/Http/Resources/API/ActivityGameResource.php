<?php

namespace App\Http\Resources\API;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityGameResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'case_summary' => $this->case_summary,
            'timeline' => $this->timeline,
            'quick_facts' => $this->quick_facts,
            'tagline' => $this->tagline,
            'roles' => $this->roles->map(function($role) {
                return [
                    'id' => $role->id,
                    'role_type' => $role->role_type,
                    'character_name' => $role->character_name,
                    'subtitle' => $role->subtitle,
                    'role_image' => $role->role_image ? asset('storage/' . $role->role_image) : null,
                    'objective' => $role->objective,
                    'what_you_know' => $role->what_you_know,
                    'keep_in_mind' => $role->keep_in_mind,
                    'footer_text' => $role->footer_text,
                    'strategy_cards' => $role->strategyCards->map(function($card) {
                        return [
                            'card_number' => $card->card_number,
                            'heading' => $card->heading,
                            'heading_color' => $card->heading_color,
                            'body_content' => $card->body_content,
                        ];
                    }),
                ];
            }),
            'investigator_cards' => $this->investigatorCards->map(function($card) {
                return [
                    'card_number' => $card->card_number,
                    'suspect_label' => $card->suspect_label,
                    'tag' => $card->tag,
                    'profile_text' => $card->profile_text,
                    'why_suspicious' => $card->why_suspicious,
                    'suggested_questions' => $card->suggested_questions,
                    'appears_at_secs' => $card->appears_at_secs,
                    'closes_at_secs' => $card->closes_at_secs,
                ];
            }),
            'photos' => $this->photos->map(function($photo) {
                return [
                    'photo_number' => $photo->photo_number,
                    'label' => $photo->label,
                    'image' => asset('storage/' . $photo->image),
                ];
            }),
            'clues' => $this->clues->map(function($clue) {
                return [
                    'clue_title' => $clue->clue_title,
                    'clue_short_description' => $clue->clue_short_description,
                    'clue_detail' => $clue->clue_detail,
                    'clue_image' => $clue->clue_image ? asset('storage/' . $clue->clue_image) : null,
                ];
            }),
            'rules' => $this->rules->map(function($rule) {
                return [
                    'rule_text' => $rule->rule_text,
                    'order' => $rule->order,
                ];
            }),
            'full_story' => $this->fullStory->map(function($story) {
                return [
                    'part_number' => $story->part_number,
                    'part_title' => $story->part_title,
                    'part_body' => $story->part_body,
                ];
            }),
        ];
    }
}
