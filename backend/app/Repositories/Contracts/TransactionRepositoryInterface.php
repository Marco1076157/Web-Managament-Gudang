<?php

namespace App\Repositories\Contracts;

use App\Models\Transaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface TransactionRepositoryInterface
{
    public function getAll(array $fields = [], array $filters = []): LengthAwarePaginator;

    public function getById(int $id, array $fields = []): Transaction;

    public function create(array $data): Transaction;

    public function createDetail(array $data): void;

    public function getByMerchantId(int $merchantId, array $fields = [], array $filters = []): LengthAwarePaginator;

    public function getDashboardSummary(?int $merchantId = null): array;
}
