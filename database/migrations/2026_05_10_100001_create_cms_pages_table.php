<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_pages', function (Blueprint $table) {
            $table->id();
            $table->string('page_name')->unique();
            $table->string('slug')->unique();
            $table->string('title');
            $table->longText('content');
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->string('featured_image')->nullable();
            $table->tinyInteger('status')->default(1)->comment('1=published,0=draft');
            $table->timestamp('published_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('slug');
            $table->index('status');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_pages');
    }
};
