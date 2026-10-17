<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * The nine static Cook & Create stage durations (seconds), shared by every
 * template — the single source of truth (one row, id = 1). Edited from any
 * template's form; applyGlobally() also copies the values to every template's
 * own columns and to every Cook & Create activity's lobby_wait_secs, which the
 * Node join/lobby code reads. New games snapshot these values when created
 * (cc_game_instances.stage_durations); games already running keep theirs.
 */
class CcStageDurations extends Model
{
    protected $table = 'cc_stage_durations';

    /** Stored on each template as well (everything except the lobby wait). */
    public const TEMPLATE_FIELDS = [
        'role_brief_secs',
        'round1_timer_secs',
        'round1_results_secs',
        'round2_submit_timer_secs',
        'round2_review_timer_secs',
        'round3_discussion_timer_secs',
        'round3_voting_timer_secs',
        'dish_naming_secs',
    ];

    public const FIELDS = ['lobby_wait_secs', ...self::TEMPLATE_FIELDS];

    public const DEFAULTS = [
        'lobby_wait_secs' => 900,
        'role_brief_secs' => 300,
        'round1_timer_secs' => 120,
        'round1_results_secs' => 60,
        'round2_submit_timer_secs' => 120,
        'round2_review_timer_secs' => 120,
        'round3_discussion_timer_secs' => 60,
        'round3_voting_timer_secs' => 120,
        'dish_naming_secs' => 60,
    ];

    protected $fillable = self::FIELDS;

    protected $casts = [
        'lobby_wait_secs' => 'integer',
        'role_brief_secs' => 'integer',
        'round1_timer_secs' => 'integer',
        'round1_results_secs' => 'integer',
        'round2_submit_timer_secs' => 'integer',
        'round2_review_timer_secs' => 'integer',
        'round3_discussion_timer_secs' => 'integer',
        'round3_voting_timer_secs' => 'integer',
        'dish_naming_secs' => 'integer',
    ];

    public static function current(): self
    {
        return static::find(1) ?? static::forceCreate(['id' => 1] + self::DEFAULTS);
    }

    /**
     * Save the given durations (any subset of FIELDS) as the global values and
     * copy the full set to every Cook & Create template and activity.
     */
    public static function applyGlobally(array $values): self
    {
        return DB::transaction(function () use ($values) {
            $row = static::current();
            $row->fill(array_intersect_key($values, array_flip(self::FIELDS)))->save();

            CcGameTemplate::query()->update($row->only(self::TEMPLATE_FIELDS));
            Activity::where('slug', 'like', 'cook%')->update(['lobby_wait_secs' => $row->lobby_wait_secs]);

            return $row;
        });
    }
}
