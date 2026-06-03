<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GamePhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'photo_number',
        'label',
        'image',
    ];

    public function game()
    {
        return $this->belongsTo(ActivityGame::class, 'game_id');
    }
}
