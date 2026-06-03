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
        Schema::create('blog_tag_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('blog_id');
            $table->unsignedBigInteger('blog_tag_id');
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('blog_id')->references('id')->on('blogs')->onDelete('cascade');
            $table->foreign('blog_tag_id')->references('id')->on('blog_tags')->onDelete('cascade');
            
            // Unique constraint
            $table->unique(['blog_id', 'blog_tag_id']);
            
            // Indexes
            $table->index('blog_id');
            $table->index('blog_tag_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_tag_items');
    }
};
