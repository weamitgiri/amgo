<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Cook & Create's cc_* tables were originally created ad-hoc at Node API boot
 * (apis/src/utils/schemaHelpers.ts::ensureCookAndCreateSchema) — the same
 * "parallel migration system" pattern already flagged as a risk for the rest
 * of this codebase. This migration brings them under Laravel's migration
 * history so the admin panel doesn't depend on the Node process having
 * booted first, without disturbing anything if Node already created them:
 * every statement is guarded, so this is a safe no-op against an existing
 * database and a full CREATE against a fresh one.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('cc_ingredients')) {
            Schema::create('cc_ingredients', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100);
                $table->string('image_url')->nullable();
                $table->boolean('is_absurd')->default(false);
                $table->unsignedBigInteger('activity_id')->default(2);
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->timestamps();
                $table->index('activity_id');
            });
        }

        if (!Schema::hasTable('cc_game_templates')) {
            Schema::create('cc_game_templates', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('activity_game_id');
                $table->string('name');
                $table->string('tagline')->nullable();
                $table->text('description')->nullable();
                $table->unsignedInteger('round1_ingredients_count')->default(10);
                $table->unsignedInteger('round1_votes_per_player')->default(2);
                $table->unsignedInteger('round1_top_ingredients')->default(4);
                $table->unsignedInteger('round1_timer_secs')->default(120);
                $table->unsignedInteger('round2_step_max_chars')->default(120);
                $table->unsignedInteger('round2_submit_timer_secs')->default(120);
                $table->unsignedInteger('round2_review_timer_secs')->default(120);
                $table->unsignedInteger('round3_discussion_timer_secs')->default(60);
                $table->unsignedInteger('round3_voting_timer_secs')->default(120);
                $table->unsignedInteger('round3_max_messages_per_player')->default(2);
                $table->boolean('show_host_role_enabled')->default(true);
                $table->text('impostor_bias_card_text')->nullable();
                $table->enum('status', ['draft', 'active'])->default('active');
                $table->timestamps();
                $table->index('activity_game_id');
            });
        }

        if (!Schema::hasTable('cc_game_template_ingredients')) {
            Schema::create('cc_game_template_ingredients', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('template_id');
                $table->unsignedBigInteger('ingredient_id');
                $table->unsignedInteger('order')->default(0);
                $table->index('template_id');
                $table->index('ingredient_id');
            });
        }

        if (!Schema::hasTable('cc_clues')) {
            Schema::create('cc_clues', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('template_id');
                $table->unsignedTinyInteger('round_number');
                $table->text('clue_text');
                $table->unsignedInteger('order')->default(0);
                $table->index('template_id');
            });
        }

        if (!Schema::hasTable('cc_game_instances')) {
            Schema::create('cc_game_instances', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('group_id')->unique();
                $table->unsignedBigInteger('template_id');
                $table->unsignedBigInteger('activity_id')->default(2);
                $table->enum('status', ['waiting', 'round1', 'round2', 'round3_discussion', 'round3_voting', 'completed'])->default('waiting');
                $table->enum('round2_phase', ['submit', 'review'])->default('submit');
                $table->unsignedBigInteger('impostor_participant_id')->nullable();
                $table->unsignedBigInteger('show_host_participant_id')->nullable();
                $table->string('dish_name')->nullable();
                $table->unsignedBigInteger('dish_named_by_participant_id')->nullable();
                $table->dateTime('round1_started_at')->nullable();
                $table->dateTime('round1_ended_at')->nullable();
                $table->dateTime('round2_started_at')->nullable();
                $table->dateTime('round2_ended_at')->nullable();
                $table->dateTime('round3_discussion_started_at')->nullable();
                $table->dateTime('round3_discussion_ended_at')->nullable();
                $table->dateTime('round3_voting_started_at')->nullable();
                $table->dateTime('round3_voting_ended_at')->nullable();
                $table->dateTime('finished_at')->nullable();
                $table->boolean('group_won')->nullable();
                $table->timestamps();
                $table->index('template_id');
            });
        } elseif (!Schema::hasColumn('cc_game_instances', 'round2_phase')) {
            Schema::table('cc_game_instances', function (Blueprint $table) {
                $table->enum('round2_phase', ['submit', 'review'])->default('submit')->after('status');
            });
        }

        if (!Schema::hasTable('cc_round1_votes')) {
            Schema::create('cc_round1_votes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('instance_id');
                $table->unsignedBigInteger('participant_id');
                $table->unsignedBigInteger('ingredient_id');
                $table->timestamp('created_at')->nullable();
                $table->unique(['instance_id', 'participant_id', 'ingredient_id'], 'unique_vote');
                $table->index('instance_id');
                $table->index('participant_id');
                $table->index('ingredient_id');
            });
        }

        if (!Schema::hasTable('cc_round1_selected_ingredients')) {
            Schema::create('cc_round1_selected_ingredients', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('instance_id');
                $table->unsignedBigInteger('ingredient_id');
                $table->unsignedInteger('vote_count')->default(0);
                $table->unsignedInteger('rank');
                $table->unique(['instance_id', 'ingredient_id'], 'unique_instance_ingredient');
                $table->index('instance_id');
            });
        }

        if (!Schema::hasTable('cc_round2_steps')) {
            Schema::create('cc_round2_steps', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('instance_id');
                $table->unsignedBigInteger('participant_id');
                $table->text('step_text');
                $table->char('step_letter', 1);
                $table->boolean('is_bad_step')->nullable();
                $table->enum('status', ['submitted', 'kept', 'removed'])->default('submitted');
                $table->timestamp('created_at')->nullable();
                $table->unique(['instance_id', 'participant_id'], 'unique_participant_step');
                $table->index('instance_id');
            });
        }

        if (!Schema::hasTable('cc_round2_step_votes')) {
            Schema::create('cc_round2_step_votes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('instance_id');
                $table->unsignedBigInteger('participant_id');
                $table->unsignedBigInteger('step_id');
                $table->enum('vote', ['keep', 'remove']);
                $table->timestamp('created_at')->nullable();
                $table->unique(['instance_id', 'participant_id', 'step_id'], 'unique_step_vote');
                $table->index('instance_id');
                $table->index('step_id');
            });
        }

        if (!Schema::hasTable('cc_round2_released_clues')) {
            Schema::create('cc_round2_released_clues', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('instance_id');
                $table->unsignedBigInteger('clue_id');
                $table->dateTime('released_at');
                $table->unique(['instance_id', 'clue_id'], 'unique_clue_instance');
                $table->index('instance_id');
            });
        }

        if (!Schema::hasTable('cc_round3_messages')) {
            Schema::create('cc_round3_messages', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('instance_id');
                $table->unsignedBigInteger('participant_id');
                $table->text('message');
                $table->boolean('is_impostor_private')->default(false);
                $table->timestamp('created_at')->useCurrent();
                $table->index('instance_id');
                $table->index('participant_id');
            });
        }

        if (!Schema::hasTable('cc_round3_impostor_votes')) {
            Schema::create('cc_round3_impostor_votes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('instance_id');
                $table->unsignedBigInteger('participant_id');
                $table->unsignedBigInteger('voted_for_participant_id');
                $table->timestamp('created_at')->nullable();
                $table->unique(['instance_id', 'participant_id'], 'unique_vote_per_participant');
                $table->index('instance_id');
            });
        }

        if (!Schema::hasTable('cc_rating_categories')) {
            Schema::create('cc_rating_categories', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100);
                $table->string('slug', 100);
                $table->string('emoji', 20)->nullable();
                $table->string('description')->nullable();
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->unsignedInteger('order')->default(0);
                $table->timestamps();
            });
        } elseif (!Schema::hasColumn('cc_rating_categories', 'created_at')) {
            // Pre-existing installs created via schemaHelpers.ts's original DDL
            // (before this migration) never had these columns, even though its
            // own seed INSERT referenced them — a bug fixed alongside this
            // migration. Add them here so older databases catch up.
            Schema::table('cc_rating_categories', function (Blueprint $table) {
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('cc_ratings')) {
            Schema::create('cc_ratings', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('instance_id');
                $table->unsignedBigInteger('category_id');
                $table->unsignedBigInteger('voting_participant_id');
                $table->unsignedBigInteger('rated_group_id')->nullable();
                $table->timestamp('created_at')->nullable();
                $table->unique(['voting_participant_id', 'rated_group_id', 'category_id'], 'unique_vote_per_category');
                $table->index('instance_id');
            });
        } else {
            $hasKey = collect(DB::select("SHOW INDEX FROM cc_ratings WHERE Key_name = 'unique_vote_per_category'"))->isNotEmpty();
            if (!$hasKey) {
                Schema::table('cc_ratings', function (Blueprint $table) {
                    $table->unique(['voting_participant_id', 'rated_group_id', 'category_id'], 'unique_vote_per_category');
                });
            }
        }

        // Sidebar entry (idempotent, same pattern as the API-logs menu migration).
        $exists = DB::table('menu')->where('link', 'admin/cook-and-create/templates')->exists();
        if (!$exists) {
            DB::table('menu')->insert([
                'name' => 'Cook & Create',
                'link' => 'admin/cook-and-create/templates',
                'parent_id' => 0,
                'icon' => 'fas fa-utensils',
                'status' => 'Active',
                'order' => 7,
                'permission_type' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('menu')->where('link', 'admin/cook-and-create/templates')->delete();
        // Table drops intentionally omitted — the Node API also depends on
        // these tables and may still be running; dropping them here would be
        // destructive to live game data. Roll back the menu entry only.
    }
};
