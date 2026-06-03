<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvestigatorCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'card_number',
        'suspect_label',
        'tag',
        'profile_text',
        'why_suspicious',
        'suggested_questions',
        'appears_at_secs',
        'closes_at_secs',
    ];

    protected $casts = [
        'why_suspicious' => 'array',
        'suggested_questions' => 'array',
    ];

    public function game()
    {
        return $this->belongsTo(ActivityGame::class, 'game_id');
    }
}
