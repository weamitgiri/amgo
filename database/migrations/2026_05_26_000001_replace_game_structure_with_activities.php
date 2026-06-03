<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // Create NEW tables
        
        // TABLE: activities
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->enum('status', ['draft', 'active'])->default('draft');
            
            // Global Game Settings
            $table->unsignedInteger('lobby_wait_secs')->default(900);
            $table->unsignedInteger('entry_cutoff_mins')->default(15);
            $table->unsignedInteger('game_duration_secs')->default(1200);
            $table->unsignedInteger('case_summary_view_secs')->default(300);
            $table->unsignedInteger('strategy_guide_delay_secs')->default(120);
            $table->unsignedInteger('clue_room_unlock_secs')->default(600);
            $table->unsignedInteger('question_response_secs')->default(120);
            $table->unsignedInteger('max_questions')->default(5);
            $table->unsignedInteger('group_size')->default(5);
            $table->unsignedInteger('auto_expire_days')->default(5);
            
            // Scoring Settings
            $table->integer('win_bonus')->default(100);
            $table->integer('participation_bonus')->default(50);
            $table->integer('timely_response_bonus')->default(20);
            $table->integer('no_response_penalty')->default(-10);
            $table->integer('wrong_vote_penalty')->default(-15);
            
            // Lie Detector Settings
            $table->boolean('lie_detector_enabled')->default(false);
            $table->unsignedInteger('lie_detector_max_questions')->default(3);
            $table->unsignedInteger('lie_detector_timer_secs')->default(420);
            $table->unsignedInteger('lie_detector_voting_timer_secs')->default(30);
            
            $table->timestamps();
        });

        // TABLE: activity_games
        Schema::create('activity_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->string('title');
            $table->longText('case_summary');
            $table->json('timeline')->nullable();
            $table->json('quick_facts')->nullable();
            $table->string('tagline')->nullable();
            $table->enum('status', ['draft', 'active'])->default('draft');
            $table->timestamps();
        });

        // TABLE: game_roles
        Schema::create('game_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('activity_games')->cascadeOnDelete();
            $table->enum('role_type', ['investigator', 'culprit', 'suspect', 'witness', 'participant']);
            $table->string('character_name');
            $table->string('subtitle')->nullable();
            $table->string('role_image')->nullable();
            $table->text('objective')->nullable();
            $table->json('what_you_know')->nullable();
            $table->json('keep_in_mind')->nullable();
            $table->string('footer_text')->nullable();
            $table->timestamps();
        });

        // TABLE: strategy_cards
        Schema::create('strategy_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('game_roles')->cascadeOnDelete();
            $table->unsignedTinyInteger('card_number');
            $table->string('heading');
            $table->string('heading_color')->default('#7F77DD');
            $table->longText('body_content');
            $table->timestamps();
        });

        // TABLE: investigator_cards
        Schema::create('investigator_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('activity_games')->cascadeOnDelete();
            $table->unsignedTinyInteger('card_number');
            $table->string('suspect_label');
            $table->string('tag')->nullable();
            $table->longText('profile_text')->nullable();
            $table->json('why_suspicious')->nullable();
            $table->json('suggested_questions')->nullable();
            $table->unsignedInteger('appears_at_secs');
            $table->unsignedInteger('closes_at_secs');
            $table->timestamps();
        });

        // TABLE: game_photos
        Schema::create('game_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('activity_games')->cascadeOnDelete();
            $table->unsignedTinyInteger('photo_number');
            $table->string('label');
            $table->string('image');
            $table->timestamps();
        });

        // TABLE: game_clues
        Schema::create('game_clues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('activity_games')->cascadeOnDelete();
            $table->string('clue_title');
            $table->string('clue_short_description')->nullable();
            $table->longText('clue_detail')->nullable();
            $table->string('clue_image')->nullable();
            $table->timestamps();
        });

        // TABLE: game_rules
        Schema::create('game_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('activity_games')->cascadeOnDelete();
            $table->string('rule_text');
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();
        });

        // TABLE: game_full_story
        Schema::create('game_full_story', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('activity_games')->cascadeOnDelete();
            $table->unsignedTinyInteger('part_number');
            $table->string('part_title');
            $table->longText('part_body');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::dropIfExists('game_full_story');
        Schema::dropIfExists('game_rules');
        Schema::dropIfExists('game_clues');
        Schema::dropIfExists('game_photos');
        Schema::dropIfExists('investigator_cards');
        Schema::dropIfExists('strategy_cards');
        Schema::dropIfExists('game_roles');
        Schema::dropIfExists('activity_games');
        Schema::dropIfExists('activities');
    }
};
