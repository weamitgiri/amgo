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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->unsignedBigInteger('role_id')->nullable()->default(0);
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->unsignedBigInteger('superadmin_id')->nullable();
            $table->string('phone')->nullable();
            $table->string('platform')->nullable();
            $table->string('currency')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('profile_photo_path')->nullable();
            $table->decimal('balance', 15, 2)->default(0);
            $table->decimal('exposure', 15, 2)->default(0);
            $table->tinyInteger('status')->default(1);
            $table->tinyInteger('usertype')->default(0)->comment('0=superadmin,1=admin,2=subadmin,3=user');
            $table->timestamp('last_activity')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();

            $table->index('role_id');
            $table->index('admin_id');
            $table->index('superadmin_id');
            $table->index('status');
            $table->index('usertype');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
