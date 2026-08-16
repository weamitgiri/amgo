<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CcGameTemplate extends Model
{
    protected $table = 'cc_game_templates';

    protected $fillable = [
        'activity_game_id',
        'name',
        'tagline',
        'description',
        'background_image',
        'chef1_image',
        'chef2_image',
        'chef3_image',
        'chef4_image',
        'show_host_image',
        'round1_ingredients_count',
        'round1_votes_per_player',
        'round1_top_ingredients',
        'round1_timer_secs',
        'round2_step_max_chars',
        'round2_submit_timer_secs',
        'round2_review_timer_secs',
        'round3_discussion_timer_secs',
        'round3_voting_timer_secs',
        'round3_max_messages_per_player',
        'show_host_role_enabled',
        'impostor_bias_card_text',
        'status',
    ];

    protected $casts = [
        'show_host_role_enabled' => 'boolean',
        'round1_ingredients_count' => 'integer',
        'round1_votes_per_player' => 'integer',
        'round1_top_ingredients' => 'integer',
        'round1_timer_secs' => 'integer',
        'round2_step_max_chars' => 'integer',
        'round2_submit_timer_secs' => 'integer',
        'round2_review_timer_secs' => 'integer',
        'round3_discussion_timer_secs' => 'integer',
        'round3_voting_timer_secs' => 'integer',
        'round3_max_messages_per_player' => 'integer',
    ];

    public function activityGame()
    {
        return $this->belongsTo(ActivityGame::class, 'activity_game_id');
    }

    public function templateIngredients()
    {
        return $this->hasMany(CcGameTemplateIngredient::class, 'template_id')->orderBy('order');
    }

    public function ingredients()
    {
        return $this->belongsToMany(CcIngredient::class, 'cc_game_template_ingredients', 'template_id', 'ingredient_id')
            ->withPivot('order')
            ->orderBy('cc_game_template_ingredients.order');
    }

    public function clues()
    {
        return $this->hasMany(CcClue::class, 'template_id')->orderBy('round_number')->orderBy('order');
    }

    public function rules()
    {
        return $this->hasMany(CcGameRule::class, 'template_id')->orderBy('order');
    }
}
