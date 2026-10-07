<?php

namespace App\Repositories\Eloquent;

use App\Models\Warehouse;
use App\Repositories\Contracts\WarehouseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class WarehouseRepository implements WarehouseRepositoryInterface
{
    public function getAll(array $fields, array $filters = []): LengthAwarePaginator
    {
        $perPage = $this->safePerPage($filters['per_page'] ?? null);

        $query = Warehouse::select($fields ?: ['*'])
            ->with(['products.category'])
            ->withCount('products')
            ->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    public function getById(int $id, array $fields): Warehouse
    {
        return Warehouse::select($fields ?: ['*'])
            ->with(['products.category'])
            ->withCount('products')
            ->findOrFail($id);
    }

    public function getProducts(int $id): Collection
    {
        return Warehouse::select(['id'])
            ->with(['products.category'])
            ->findOrFail($id)
            ->products;
    }

    public function create(array $data): Warehouse
    {
        return Warehouse::create($data);
    }

    public function update(int $id, array $data): Warehouse
    {
        $warehouse = Warehouse::findOrFail($id);
        $warehouse->update($data);

        return $warehouse;
    }

    public function delete(int $id): void
    {
        $warehouse = Warehouse::findOrFail($id);
        $warehouse->delete();
    }

    private function applyFilters($query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }
    }

    private function safePerPage($perPage): int
    {
        $perPage = (int) $perPage;

        return ($perPage >= 1 && $perPage <= 100) ? $perPage : 10;
    }
}
