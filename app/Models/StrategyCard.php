<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StrategyCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'role_id',
        'card_number',
        'heading',
        'heading_color',
        'body_content',
    ];

    public function role()
    {
        return $this->belongsTo(GameRole::class, 'role_id');
    }
}
