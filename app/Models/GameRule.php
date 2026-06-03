<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'rule_text',
        'order',
    ];

    public function game()
    {
        return $this->belongsTo(ActivityGame::class, 'game_id');
    }
}
