<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CcGameRule extends Model
{
    protected $table = 'cc_game_rules';

    public $timestamps = false;

    protected $fillable = [
        'template_id',
        'rule_text',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];
}
