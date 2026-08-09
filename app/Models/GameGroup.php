<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * `game_groups` has no Eloquent model in the Laravel app yet — it's primarily
 * managed by the Node API (apis/src/services/*). This is a minimal, read-mostly
 * mapping added for the Cook & Create admin session browser; it doesn't change
 * how Mystery Quest or the Node API interact with this table.
 */
class GameGroup extends Model
{
    protected $table = 'game_groups';

    protected $fillable = [
        'booking_id',
        'game_id',
        'group_name',
        'status',
        'completed_at',
        'retention_purge_at',
        'purged_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'retention_purge_at' => 'datetime',
        'purged_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(OrganizerBooking::class, 'booking_id');
    }

    public function participants()
    {
        return $this->hasMany(GameParticipant::class, 'group_id');
    }

    public function ccInstance()
    {
        return $this->hasOne(CcGameInstance::class, 'group_id');
    }
}
