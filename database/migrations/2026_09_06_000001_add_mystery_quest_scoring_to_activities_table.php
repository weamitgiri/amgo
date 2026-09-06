<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mystery Quest scoreboard-logic settings, made admin-configurable per activity.
 *
 * These map 1:1 to the "Mystery Quest — Scoreboard Logic" spec (§1–§3). Values
 * that were previously hard-coded in the Node game engine now come from here so
 * an admin can tune every scoring event. Defaults are the spec's values.
 *
 * The pre-existing no_response_penalty column already covered the −10 timeout
 * penalty and is left as-is. The legacy win_bonus / participation_bonus /
 * timely_response_bonus / wrong_vote_penalty columns are unused by the engine
 * and are left in place untouched (removing them risks breaking old rows).
 */
return new class extends Migration
{
    /** column => default (spec value) */
    private array $columns = [
        'investigator_question_bonus'        => 10,   // +10 per question asked
        'investigator_correct_bonus'         => 80,   // correct accusation
        'investigator_wrong_penalty'         => -30,  // wrong accusation
        'investigator_no_accusation_penalty' => -20,  // no accusation before timer
        'lie_detector_init_bonus'            => 5,    // initiates lie-detector round
        'lie_detector_participation_bonus'   => 5,    // answers directed Q / casts a vote
        'culprit_win_bonus'                  => 100,  // not identified — culprit wins
        'culprit_caught_penalty'             => -20,  // correctly identified
        'role_correct_bonus'                 => 50,   // suspect/witness/participant correct guess
        'role_wrong_penalty'                 => -10,  // wrong guess
        'witness_passcard_bonus'             => 10,   // witness uses secret passcard
    ];

    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            foreach ($this->columns as $name => $default) {
                if (!Schema::hasColumn('activities', $name)) {
                    $table->integer($name)->default($default)->after('no_response_penalty');
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            foreach (array_keys($this->columns) as $name) {
                if (Schema::hasColumn('activities', $name)) {
                    $table->dropColumn($name);
                }
            }
        });
    }
};
