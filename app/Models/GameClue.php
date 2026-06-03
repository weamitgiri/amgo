<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameClue extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'clue_title',
        'clue_short_description',
        'clue_detail',
        'clue_image',
    ];

    public function game()
    {
        return $this->belongsTo(ActivityGame::class, 'game_id');
    }
}
