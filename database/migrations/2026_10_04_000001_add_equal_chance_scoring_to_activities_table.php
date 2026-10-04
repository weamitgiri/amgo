<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Equal Chance" scoreboard model (Mystery Quest — Scoreboard Logic PDF).
 *
 * Every role can earn the same five parts, max 100:
 *   Role goal +60, Cooperation +10, Lie Detector +10, Clue Room +10,
 *   Final accusation +10. Penalties: −10 per missed answer (max −20),
 *   Investigator with no accusation −20.
 *
 * Lie-Detector uses the existing lie_detector_participation_bonus column, the
 * answer-timeout penalty uses no_response_penalty, and the Investigator
 * no-accusation penalty uses investigator_no_accusation_penalty. These four new
 * columns cover the parts that had no column. Legacy per-role bonus columns are
 * left in place (unused by the new model) so old rows don't break.
 */
return new class extends Migration
{
    /** column => default (PDF value) */
    private array $columns = [
        'role_goal_bonus'        => 60,
        'cooperation_bonus'      => 10,
        'clue_room_bonus'        => 10,
        'final_accusation_bonus' => 10,
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
        // Align the reused columns to the PDF values where they still hold the old defaults.
        \DB::table('activities')->where('lie_detector_participation_bonus', 5)->update(['lie_detector_participation_bonus' => 10]);
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
