<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // game_groups.status widened to support real game-completion states, plus
        // retention/PDF bookkeeping columns. The Node API's schemaHelpers.ts applies
        // the same changes defensively at boot — this migration is the durable,
        // reviewable record of that schema.
        DB::statement("ALTER TABLE game_groups MODIFY COLUMN status ENUM('waiting','active','finished','completed','incomplete') NOT NULL DEFAULT 'waiting'");

        Schema::table('game_groups', function (Blueprint $table) {
            if (!Schema::hasColumn('game_groups', 'completed_at')) {
                $table->timestamp('completed_at')->nullable();
            }
            if (!Schema::hasColumn('game_groups', 'retention_purge_at')) {
                $table->timestamp('retention_purge_at')->nullable();
            }
            if (!Schema::hasColumn('game_groups', 'purged_at')) {
                $table->timestamp('purged_at')->nullable();
            }
            if (!Schema::hasColumn('game_groups', 'results_pdf_path')) {
                $table->string('results_pdf_path')->nullable();
            }
            if (!Schema::hasColumn('game_groups', 'results_pdf_expires_at')) {
                $table->timestamp('results_pdf_expires_at')->nullable();
            }
        });

        Schema::table('participant_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('participant_sessions', 'left_at')) {
                $table->timestamp('left_at')->nullable();
            }
        });

        Schema::table('timers', function (Blueprint $table) {
            if (!Schema::hasColumn('timers', 'reference_id')) {
                $table->unsignedBigInteger('reference_id')->nullable()->after('timer_type');
            }
        });

        if (!Schema::hasTable('votes')) {
            Schema::create('votes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('group_id');
                $table->unsignedBigInteger('voter_id');
                $table->unsignedBigInteger('reference_id');
                $table->string('reference_type', 50);
                $table->string('vote_value', 20);
                $table->timestamps();
                $table->unique(['reference_id', 'reference_type', 'voter_id'], 'votes_unique_voter_per_reference');
            });
        }

        if (!Schema::hasTable('group_accusations')) {
            Schema::create('group_accusations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('group_id');
                $table->unsignedBigInteger('participant_session_id')->unique();
                $table->unsignedBigInteger('accused_session_id');
                $table->text('reasoning');
                $table->timestamps();
            });
        }

        Schema::table('results', function (Blueprint $table) {
            if (!Schema::hasColumn('results', 'correct_guess_count')) {
                $table->unsignedTinyInteger('correct_guess_count')->nullable();
            }
            if (!Schema::hasColumn('results', 'per_role_results')) {
                $table->json('per_role_results')->nullable();
            }
        });

        Schema::table('activity_games', function (Blueprint $table) {
            if (!Schema::hasColumn('activity_games', 'victim_name')) {
                $table->string('victim_name')->nullable();
            }
        });
        DB::table('activity_games')
            ->where('title', 'The Bungalow Secret')
            ->whereNull('victim_name')
            ->update(['victim_name' => 'Raghav Malhotra']);

        // Session total is 25 minutes (5 min case summary + 20 min investigation).
        // Only touch rows still holding the old default combination, so a
        // deliberately customized activity is never clobbered.
        DB::statement('ALTER TABLE activities ALTER COLUMN game_duration_secs SET DEFAULT 1500');
        DB::table('activities')
            ->where('game_duration_secs', 1200)
            ->where('case_summary_view_secs', 300)
            ->update(['game_duration_secs' => 1500]);
    }

    public function down(): void
    {
        Schema::dropIfExists('group_accusations');
        Schema::dropIfExists('votes');

        Schema::table('results', function (Blueprint $table) {
            $table->dropColumn(['correct_guess_count', 'per_role_results']);
        });

        Schema::table('activity_games', function (Blueprint $table) {
            $table->dropColumn('victim_name');
        });

        Schema::table('timers', function (Blueprint $table) {
            $table->dropColumn('reference_id');
        });

        Schema::table('participant_sessions', function (Blueprint $table) {
            $table->dropColumn('left_at');
        });

        Schema::table('game_groups', function (Blueprint $table) {
            $table->dropColumn(['completed_at', 'retention_purge_at', 'purged_at', 'results_pdf_path', 'results_pdf_expires_at']);
        });

        DB::statement("ALTER TABLE game_groups MODIFY COLUMN status ENUM('waiting','active','finished') NOT NULL DEFAULT 'waiting'");
        DB::statement('ALTER TABLE activities ALTER COLUMN game_duration_secs SET DEFAULT 1200');
    }
};
