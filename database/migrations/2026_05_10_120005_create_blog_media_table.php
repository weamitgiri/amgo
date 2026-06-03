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
        Schema::create('blog_media', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('blog_id');
            $table->string('media_path');
            $table->string('media_type'); // image, video, document
            $table->string('alt_text')->nullable();
            $table->text('caption')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign keys
            $table->foreign('blog_id')->references('id')->on('blogs')->onDelete('cascade');
            
            // Indexes
            $table->index('blog_id');
            $table->index('media_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_media');
    }
};
