<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityGame extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'title',
        'case_summary',
        'timeline',
        'quick_facts',
        'tagline',
        'status',
    ];

    protected $casts = [
        'timeline' => 'array',
        'quick_facts' => 'array',
        'status' => 'string',
    ];

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function roles()
    {
        return $this->hasMany(GameRole::class, 'game_id');
    }

    public function investigatorCards()
    {
        return $this->hasMany(InvestigatorCard::class, 'game_id')->orderBy('card_number');
    }

    public function photos()
    {
        return $this->hasMany(GamePhoto::class, 'game_id')->orderBy('photo_number');
    }

    public function clues()
    {
        return $this->hasMany(GameClue::class, 'game_id');
    }

    public function rules()
    {
        return $this->hasMany(GameRule::class, 'game_id')->orderBy('order');
    }

    public function fullStory()
    {
        return $this->hasMany(GameFullStory::class, 'game_id')->orderBy('part_number');
    }

    public function getTimeSettings(): array
    {
        return $this->activity->getTimeSettings();
    }
}
