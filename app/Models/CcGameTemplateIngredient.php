<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CcGameTemplateIngredient extends Model
{
    protected $table = 'cc_game_template_ingredients';

    public $timestamps = false;

    protected $fillable = [
        'template_id',
        'ingredient_id',
        'order',
    ];

    public function ingredient()
    {
        return $this->belongsTo(CcIngredient::class, 'ingredient_id');
    }
}
