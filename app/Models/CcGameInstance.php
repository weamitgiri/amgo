<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Read-mostly — this table is written by the Node API (apis/src/services/
 * cookandcreateService.ts) during live gameplay. The admin panel only reads
 * it for the session browser (Part 10).
 */
class CcGameInstance extends Model
{
    protected $table = 'cc_game_instances';

    protected $casts = [
        'round1_started_at' => 'datetime',
        'round1_ended_at' => 'datetime',
        'round2_started_at' => 'datetime',
        'round2_ended_at' => 'datetime',
        'round3_discussion_started_at' => 'datetime',
        'round3_discussion_ended_at' => 'datetime',
        'round3_voting_started_at' => 'datetime',
        'round3_voting_ended_at' => 'datetime',
        'finished_at' => 'datetime',
        'group_won' => 'boolean',
    ];

    public function group()
    {
        return $this->belongsTo(GameGroup::class, 'group_id');
    }

    public function template()
    {
        return $this->belongsTo(CcGameTemplate::class, 'template_id');
    }

    public function impostor()
    {
        return $this->belongsTo(GameParticipant::class, 'impostor_participant_id');
    }

    public function showHost()
    {
        return $this->belongsTo(GameParticipant::class, 'show_host_participant_id');
    }
}
