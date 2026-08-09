<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CcClue extends Model
{
    protected $table = 'cc_clues';

    public $timestamps = false;

    protected $fillable = [
        'template_id',
        'round_number',
        'clue_text',
        'order',
    ];

    protected $casts = [
        'round_number' => 'integer',
        'order' => 'integer',
    ];
}
