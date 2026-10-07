<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Index untuk mempercepat query dashboard & daftar transaksi.
     *
     * CATATAN PENTING soal index foreign key:
     * Kolom FK (transactions.merchant_id, transaction_products.transaction_id,
     * transaction_products.product_id) TIDAK boleh di-index manual di sini.
     * InnoDB/MySQL otomatis membuatkan index untuk setiap foreign key constraint
     * (named <table>_<column>_foreign). Kalau kita menambah index kedua dengan
     * nama custom, hasilnya index duplikat yang hanya memboroskan ruang tulis.
     *
     * Kolom non-FK (created_at, status) tetap di-index karena memang tidak
     * punya index dari definisi kolom.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // created_at -> untuk orderBy latest() (dashboard + list)
            $this->addIndexIfMissing($table, 'transactions', 'created_at', 'idx_transactions_created_at');

            // status -> filter status transaksi
            $this->addIndexIfMissing($table, 'transactions', 'status', 'idx_transactions_status');

            // merchant_id SENGAJA TIDAK di-index di sini.
            // Sudah tercakup index otomatis dari FK -> merchants.
        });

        // transaction_products.transaction_id & product_id juga dilewati:
        // keduanya FK dan sudah punya index otomatis.
        // Table ini hanya perlu lookup lewat FK, jadi tidak ada index tambahan.
    }

    public function down(): void
    {
        $this->dropIndexIfExists('transactions', 'idx_transactions_created_at');
        $this->dropIndexIfExists('transactions', 'idx_transactions_status');
    }

    /**
     * Menambah index hanya jika belum ada index yang MEMCAKUP kolom tsb.
     *
     * Penting: pengecekan dilakukan per-KOLOM, bukan per-NAMA.
     * Index foreign key bawaan MySQL bernama `transactions_merchant_id_foreign`
     * dan TIDAK akan terdeteksi kalau kita cuma cek nama custom kita sendiri.
     * Caretulah yang membuat index duplikat.
     */
    private function addIndexIfMissing(
        Blueprint $table,
        string $tableName,
        string $column,
        string $indexName
    ): void {
        if (! Schema::hasColumn($tableName, $column)) {
            return;
        }

        if ($this->hasIndexCoveringColumn($tableName, $column)) {
            return;
        }

        $table->index($column, $indexName);
    }

    private function hasIndexCoveringColumn(string $table, string $column): bool
    {
        foreach (Schema::getIndexes($table) as $index) {
            $columns = array_map('strtolower', $index['columns'] ?? []);

            if (in_array(strtolower($column), $columns, true)) {
                return true;
            }
        }

        return false;
    }

    private function dropIndexIfExists(string $table, string $indexName): void
    {
        if (! Schema::hasIndex($table, $indexName)) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($indexName) {
            $blueprint->dropIndex($indexName);
        });
    }
};
