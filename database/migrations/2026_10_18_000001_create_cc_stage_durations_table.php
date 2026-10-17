<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * One global set of the nine static Cook & Create stage durations, shared by
 * every template (single row, id = 1). The template form edits this row; saving
 * also copies the values to every template's own columns and to every Cook &
 * Create activity's lobby_wait_secs, which the join/lobby code reads.
 *
 * cc_game_instances.stage_durations snapshots the eight in-game durations when a
 * game is created, so a game in progress keeps the durations it started with.
 * Existing games are backfilled from their template BEFORE the global values are
 * first applied, so nothing already running changes.
 *
 * Guarded like the rest of the cc_* schema: a safe no-op if the Node API already
 * created these at boot (apis/src/utils/schemaHelpers.ts), which does the same.
 */
return new class extends Migration
{
    private const TEMPLATE_FIELDS = [
        'role_brief_secs', 'round1_timer_secs', 'round1_results_secs',
        'round2_submit_timer_secs', 'round2_review_timer_secs',
        'round3_discussion_timer_secs', 'round3_voting_timer_secs', 'dish_naming_secs',
    ];

    public function up(): void
    {
        if (!Schema::hasColumn('cc_game_instances', 'stage_durations')) {
            Schema::table('cc_game_instances', function (Blueprint $table) {
                $table->json('stage_durations')->nullable()->after('template_id');
            });
        }
        // Existing games keep the durations their template has right now.
        $json = 'JSON_OBJECT(' . collect(self::TEMPLATE_FIELDS)
            ->map(fn ($f) => "'{$f}', t.{$f}")->implode(', ') . ')';
        DB::statement("UPDATE cc_game_instances ci JOIN cc_game_templates t ON t.id = ci.template_id
                       SET ci.stage_durations = {$json} WHERE ci.stage_durations IS NULL");

        if (Schema::hasTable('cc_stage_durations')) {
            return;
        }
        Schema::create('cc_stage_durations', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->unsignedInteger('lobby_wait_secs')->default(900);
            $table->unsignedInteger('role_brief_secs')->default(300);
            $table->unsignedInteger('round1_timer_secs')->default(120);
            $table->unsignedInteger('round1_results_secs')->default(60);
            $table->unsignedInteger('round2_submit_timer_secs')->default(120);
            $table->unsignedInteger('round2_review_timer_secs')->default(120);
            $table->unsignedInteger('round3_discussion_timer_secs')->default(60);
            $table->unsignedInteger('round3_voting_timer_secs')->default(120);
            $table->unsignedInteger('dish_naming_secs')->default(60);
            $table->timestamps();
        });

        // Start from the most recently saved template (the admin's latest intent).
        $latest = DB::table('cc_game_templates as t')
            ->leftJoin('activity_games as g', 'g.id', '=', 't.activity_game_id')
            ->leftJoin('activities as a', 'a.id', '=', 'g.activity_id')
            ->orderByDesc('t.updated_at')->orderByDesc('t.id')
            ->select(array_merge(array_map(fn ($f) => "t.{$f}", self::TEMPLATE_FIELDS), ['a.lobby_wait_secs']))
            ->first();
        $values = $latest ? array_filter((array) $latest, fn ($v) => $v !== null) : [];

        DB::table('cc_stage_durations')->insert(['id' => 1, 'created_at' => now(), 'updated_at' => now()] + $values);
        $row = (array) DB::table('cc_stage_durations')->where('id', 1)->first();

        DB::table('cc_game_templates')->update(array_intersect_key($row, array_flip(self::TEMPLATE_FIELDS)));
        DB::table('activities')->where('slug', 'like', 'cook%')->update(['lobby_wait_secs' => $row['lobby_wait_secs']]);
    }

    public function down(): void
    {
        Schema::dropIfExists('cc_stage_durations');
        if (Schema::hasColumn('cc_game_instances', 'stage_durations')) {
            Schema::table('cc_game_instances', function (Blueprint $table) {
                $table->dropColumn('stage_durations');
            });
        }
    }
};
