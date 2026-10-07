<?php

namespace App\Repositories\Contracts;

use App\Models\Warehouse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface WarehouseRepositoryInterface
{
    public function getAll(array $fields, array $filters = []): LengthAwarePaginator;

    public function getById(int $id, array $fields): Warehouse;

    public function getProducts(int $id): Collection;

    public function create(array $data): Warehouse;

    public function update(int $id, array $data): Warehouse;

    public function delete(int $id): void;
}
