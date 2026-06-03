<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('subject');
            $table->longText('body');
            $table->json('variables')->nullable()->comment('Available variables in template');
            $table->text('description')->nullable();
            $table->tinyInteger('status')->default(1)->comment('1=active,0=inactive');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->integer('usage_count')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('slug');
            $table->index('status');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
