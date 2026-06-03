<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameFullStory extends Model
{
    use HasFactory;

    protected $table = 'game_full_story';

    protected $fillable = [
        'game_id',
        'part_number',
        'part_title',
        'part_body',
    ];

    public function game()
    {
        return $this->belongsTo(ActivityGame::class, 'game_id');
    }
}
