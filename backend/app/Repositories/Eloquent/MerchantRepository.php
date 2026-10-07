<?php

namespace App\Repositories\Eloquent;

use App\Models\Merchant;
use App\Models\MerchantProduct;
use App\Repositories\Contracts\MerchantRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class MerchantRepository implements MerchantRepositoryInterface
{
    public function getAll(array $fields, array $filters = []): LengthAwarePaginator
    {
        $perPage = $this->safePerPage($filters['per_page'] ?? null);

        $query = Merchant::select($fields ?: ['*'])
            ->with(['keeper', 'products.category'])
            ->withCount('products')
            ->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    public function getById(int $id, array $fields): Merchant
    {
        return Merchant::select($fields ?: ['*'])
            ->with(['keeper', 'products.category'])
            ->withCount('products')
            ->findOrFail($id);
    }

    public function getProducts(int $id): Collection
    {
        return Merchant::select(['id'])
            ->with(['products.category'])
            ->findOrFail($id)
            ->products;
    }

    public function create(array $data): Merchant
    {
        return Merchant::create($data);
    }

    public function update(int $id, array $data): Merchant
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->update($data);

        return $merchant;
    }

    public function delete(int $id): void
    {
        $merchant = Merchant::findOrFail($id);
        $merchant->delete();
    }

    public function getByKeeperId(int $keeperId, array $fields = ['*']): Merchant
    {
        return Merchant::select($fields)
            ->where('keeper_id', $keeperId)
            ->with(['products.category', 'keeper'])
            ->withCount('products')
            ->firstOrFail();
    }

    public function checkStock(int $merchantId, int $productId): ?Merchant
    {
        return Merchant::where('id', $merchantId)
            ->whereHas('products', function ($query) use ($productId) {
                $query->where('products.id', $productId)
                    ->where('merchant_products.stock', '>', 0);
            })
            ->first();
    }

    public function decrementStock(int $merchantId, int $productId, int $qty): void
    {
        $merchantProduct = MerchantProduct::where('merchant_id', $merchantId)
            ->where('product_id', $productId)
            ->firstOrFail();

        $merchantProduct->decrement('stock', $qty);
    }

    private function applyFilters($query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas(
                        'keeper',
                        fn ($kq) => $kq->where('name', 'like', "%{$search}%")
                    );
            });
        }

        if (! empty($filters['keeper_id'])) {
            $query->where('keeper_id', $filters['keeper_id']);
        }
    }

    private function safePerPage($perPage): int
    {
        $perPage = (int) $perPage;

        return ($perPage >= 1 && $perPage <= 100) ? $perPage : 10;
    }
}
