<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 *_users.photo_ dan _users.phone_ awalnya NOT NULL tanpa default value,
 * padahal form Tambah User tidak mengirim kedua field itu. Akibatnya
 * INSERT gagal dengan:
 *   SQLSTATE[HY000]: General error: 1364 Field 'photo' doesn't have a default value
 *
 * Kolom `phone` tetap unik; MySQL mengizinkan banyak NULL pada unique index,
 * jadi user tanpa nomor telepon tidak saling bentrok.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('photo')->nullable()->change();
            $table->string('phone')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('photo')->nullable(false)->change();
            $table->string('phone')->nullable(false)->change();
        });
    }
};
