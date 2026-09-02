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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();          // slug identifier e.g. 'مدير_عام' or 'general_manager'
            $table->string('display_name_ar');         // 'مدير عام'
            $table->text('description_ar')->nullable();
            $table->boolean('requires_geo_scope')->default(false); // e.g. true for مراجع_أنشطة
            $table->boolean('is_system')->default(false);          // System roles cannot be deleted
            $table->timestamps();
        });

        // Pivot table for dynamic roles and permissions
        Schema::create('permission_role', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['role_id', 'permission_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('roles');
    }
};
