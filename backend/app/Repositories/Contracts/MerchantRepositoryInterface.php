<?php

namespace App\Repositories\Contracts;

use App\Models\Merchant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface MerchantRepositoryInterface
{
    public function getAll(array $fields, array $filters = []): LengthAwarePaginator;

    public function getById(int $id, array $fields): Merchant;

    public function getProducts(int $id): Collection;

    public function create(array $data): Merchant;

    public function update(int $id, array $data): Merchant;

    public function delete(int $id): void;

    public function getByKeeperId(int $keeperId, array $fields = ['*']): Merchant;

    public function checkStock(int $merchantId, int $productId): ?Merchant;

    public function decrementStock(int $merchantId, int $productId, int $qty): void;
}
