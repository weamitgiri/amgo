<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('short_description');
            $table->longText('content');
            $table->string('featured_image')->nullable();
            $table->string('banner_image')->nullable();
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('author_id');
            
            // SEO fields
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('seo_keywords')->nullable();
            $table->string('og_image')->nullable();
            $table->string('canonical_url')->nullable();
            
            // Publishing
            $table->string('status')->default('draft'); // draft, published, scheduled, archived
            $table->dateTime('published_at')->nullable();
            $table->dateTime('scheduled_at')->nullable();
            
            // Features
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_trending')->default(false);
            $table->boolean('show_on_homepage')->default(false);
            $table->boolean('allow_comments')->default(true);
            $table->boolean('show_author')->default(true);
            $table->boolean('show_related_blogs')->default(true);
            
            // Stats
            $table->integer('reading_time')->nullable();
            $table->integer('views_count')->default(0);
            $table->integer('comments_count')->default(0);
            
            // Meta
            $table->string('external_source_url')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('category_id')->references('id')->on('blog_categories')->onDelete('cascade');
            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            // Indexes
            $table->index('slug');
            $table->index('status');
            $table->index('category_id');
            $table->index('author_id');
            $table->index('published_at');
            $table->index('is_featured');
            $table->index('views_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
