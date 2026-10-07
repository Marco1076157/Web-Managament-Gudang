<?php

namespace App\Repositories\Eloquent;

use App\Models\Transaction;
use App\Models\TransactionProduct;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TransactionRepository implements TransactionRepositoryInterface
{
    /**
     * Relasi yang di-eager load.
     * WAJIB memuat product.category: tanpa itu setiap item transaksi
     * akan memicu 1 query terpisah (N+1 problem).
     */
    private const WITH = [
        'merchant:id,name',
        'transactionProducts',
        'transactionProducts.product:id,name,price,category_id,thumbnail',
        'transactionProducts.product.category:id,name',
    ];

    /** Kolom yang benar-benar dipakai oleh frontend. */
    private const FIELDS = [
        'id',
        'transaction_code',
        'merchant_id',
        'customer_name',
        'customer_phone',
        'total_amount',
        'tax_amount',
        'status',
        'created_at',
    ];

    public function getAll(array $fields = [], array $filters = []): LengthAwarePaginator
    {
        $perPage = $this->safePerPage($filters['per_page'] ?? null);

        $query = Transaction::select($fields ?: self::FIELDS)
            ->with(self::WITH)
            ->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    public function getById(int $id, array $fields = []): Transaction
    {
        return Transaction::select($fields ?: self::FIELDS)
            ->with(self::WITH)
            ->findOrFail($id);
    }

    public function create(array $data): Transaction
    {
        return Transaction::create($data);
    }

    public function createDetail(array $data): void
    {
        TransactionProduct::create($data);
    }

    public function getByMerchantId(int $merchantId, array $fields = [], array $filters = []): LengthAwarePaginator
    {
        $perPage = $this->safePerPage($filters['per_page'] ?? null);

        $query = Transaction::select($fields ?: self::FIELDS)
            ->where('merchant_id', $merchantId)
            ->with(self::WITH)
            ->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    /**
     * Aggregate untuk Stat Cards dashboard (1 query, bukan ambil semua baris).
     */
    public function getDashboardSummary(?int $merchantId = null): array
    {
        $base = Transaction::query();

        if ($merchantId !== null) {
            $base->where('merchant_id', $merchantId);
        }

        $totals = $base->selectRaw('COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as total')->first();

        $productsSold = TransactionProduct::query()
            ->selectRaw('COALESCE(SUM(quantity), 0) as sold')
            ->when(
                $merchantId !== null,
                fn ($q) => $q->whereIn(
                    'transaction_id',
                    Transaction::where('merchant_id', $merchantId)->select('id')
                )
            )
            ->value('sold');

        return [
            'totalRevenue' => (int) ($totals->revenue ?? 0),
            'totalTransactions' => (int) ($totals->total ?? 0),
            'productsSold' => (int) ($productsSold ?? 0),
        ];
    }

    private function applyFilters($query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('transaction_code', 'like', "%{$search}%")
                    ->orWhereHas(
                        'merchant',
                        fn ($mq) => $mq->where('name', 'like', "%{$search}%")
                    );
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['merchant_id'])) {
            $query->where('merchant_id', $filters['merchant_id']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
    }

    private function safePerPage($perPage): int
    {
        $perPage = (int) $perPage;

        return ($perPage >= 1 && $perPage <= 100) ? $perPage : 10;
    }
}
