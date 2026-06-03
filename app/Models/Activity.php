<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'cover_image',
        'icon',
        'status',
        'lobby_wait_secs',
        'entry_cutoff_mins',
        'game_duration_secs',
        'case_summary_view_secs',
        'strategy_guide_delay_secs',
        'clue_room_unlock_secs',
        'question_response_secs',
        'max_questions',
        'group_size',
        'auto_expire_days',
        'win_bonus',
        'participation_bonus',
        'timely_response_bonus',
        'no_response_penalty',
        'wrong_vote_penalty',
        'lie_detector_enabled',
        'lie_detector_max_questions',
        'lie_detector_timer_secs',
        'lie_detector_voting_timer_secs',
    ];

    protected $casts = [
        'status' => 'string',
        'lie_detector_enabled' => 'boolean',
        'lobby_wait_secs' => 'integer',
        'entry_cutoff_mins' => 'integer',
        'game_duration_secs' => 'integer',
        'case_summary_view_secs' => 'integer',
        'strategy_guide_delay_secs' => 'integer',
        'clue_room_unlock_secs' => 'integer',
        'question_response_secs' => 'integer',
        'max_questions' => 'integer',
        'group_size' => 'integer',
        'auto_expire_days' => 'integer',
        'win_bonus' => 'integer',
        'participation_bonus' => 'integer',
        'timely_response_bonus' => 'integer',
        'no_response_penalty' => 'integer',
        'wrong_vote_penalty' => 'integer',
        'lie_detector_max_questions' => 'integer',
        'lie_detector_timer_secs' => 'integer',
        'lie_detector_voting_timer_secs' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($activity) {
            if (empty($activity->slug)) {
                $activity->slug = Str::slug($activity->title);
            }
        });
    }

    public function games()
    {
        return $this->hasMany(ActivityGame::class);
    }

    public function getTimeSettings(): array
    {
        return [
            'lobby_wait_secs' => $this->lobby_wait_secs,
            'game_duration_secs' => $this->game_duration_secs,
            'case_summary_view_secs' => $this->case_summary_view_secs,
            'strategy_guide_delay_secs' => $this->strategy_guide_delay_secs,
            'clue_room_unlock_secs' => $this->clue_room_unlock_secs,
            'question_response_secs' => $this->question_response_secs,
            'entry_cutoff_mins' => $this->entry_cutoff_mins,
            'max_questions' => $this->max_questions,
            'group_size' => $this->group_size,
            'auto_expire_days' => $this->auto_expire_days,
            'win_bonus' => $this->win_bonus,
            'participation_bonus' => $this->participation_bonus,
            'timely_response_bonus' => $this->timely_response_bonus,
            'no_response_penalty' => $this->no_response_penalty,
            'wrong_vote_penalty' => $this->wrong_vote_penalty,
            'lie_detector_enabled' => $this->lie_detector_enabled,
            'lie_detector_max_questions' => $this->lie_detector_max_questions,
            'lie_detector_timer_secs' => $this->lie_detector_timer_secs,
            'lie_detector_voting_timer_secs' => $this->lie_detector_voting_timer_secs,
        ];
    }
}
