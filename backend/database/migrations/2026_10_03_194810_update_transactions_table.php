<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['name', 'phone', 'sub_total', 'tax_total', 'grand_total']);
            $table->string('transaction_code')->unique()->after('id');
            $table->string('customer_name')->after('transaction_code');
            $table->string('customer_phone')->nullable()->after('customer_name');
            $table->unsignedInteger('total_amount')->after('customer_phone');
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending')->after('total_amount');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['transaction_code', 'customer_name', 'customer_phone', 'total_amount', 'status']);
            $table->string('name')->index();
            $table->string('phone')->index();
            $table->unsignedInteger('sub_total');
            $table->unsignedInteger('tax_total');
            $table->unsignedInteger('grand_total')->index();
        });
    }
};