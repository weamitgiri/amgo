<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'role_type',
        'character_name',
        'subtitle',
        'role_image',
        'objective',
        'what_you_know',
        'keep_in_mind',
        'footer_text',
    ];

    protected $casts = [
        'what_you_know' => 'array',
        'keep_in_mind' => 'array',
        'role_type' => 'string',
    ];

    public function game()
    {
        return $this->belongsTo(ActivityGame::class, 'game_id');
    }

    public function strategyCards()
    {
        return $this->hasMany(StrategyCard::class, 'role_id')->orderBy('card_number');
    }
}
