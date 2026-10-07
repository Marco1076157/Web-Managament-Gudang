<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('slug')->unique()->after('name');
            $table->string('icon')->nullable()->after('slug');
            $table->string('photo')->nullable()->change();
            $table->text('tagline')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['slug', 'icon']);
            $table->string('photo')->nullable(false)->change();
            $table->string('tagline')->nullable(false)->change();
        });
    }
};