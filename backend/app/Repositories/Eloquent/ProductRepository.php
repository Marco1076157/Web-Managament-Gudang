<?php

namespace App\Repositories\Eloquent;

use App\Models\MerchantProduct;
use App\Models\Product;
use App\Models\WarehouseProduct;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    public function getAll(array $fields, array $filters = []): LengthAwarePaginator
    {
        $perPage = $this->safePerPage($filters['per_page'] ?? null);

        $query = Product::select($fields ?: ['*'])
            ->with('category')
            ->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    public function getById(int $id, array $fields): Product
    {
        return Product::select($fields ?: ['*'])->with('category')->findOrFail($id);
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(int $id, array $data): Product
    {
        $product = Product::findOrFail($id);
        $product->update($data);

        return $product;
    }

    public function delete(int $id): void
    {
        $product = Product::findOrFail($id);
        $product->delete();
    }

    private function applyFilters($query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('about', 'like', "%{$search}%")
                    ->orWhereHas(
                        'category',
                        fn ($cq) => $cq->where('name', 'like', "%{$search}%")
                    );
            });
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['is_popular'])) {
            $query->where('is_popular', $filters['is_popular']);
        }

        // Produk milik sebuah merchant beserta stok dari pivot merchant_products.
        // Dibutuhkan Keeper (POS & Overview) agar tidak melihat produk toko lain.
        if (! empty($filters['merchant_id'])) {
            $merchantId = (int) $filters['merchant_id'];

            $query->whereIn('id', function ($subSelect) use ($merchantId) {
                $subSelect->select('product_id')
                    ->from('merchant_products')
                    ->where('merchant_id', $merchantId);
            })->selectSub(
                MerchantProduct::select('stock')
                    ->where('merchant_id', $merchantId)
                    ->whereColumn('merchant_products.product_id', 'products.id')
                    ->limit(1),
                'stock'
            );
        }

        // Produk yang sudah dititipkan di gudang, lengkap dengan stok pivot.
        if (! empty($filters['warehouse_id'])) {
            $warehouseId = (int) $filters['warehouse_id'];

            $query->whereIn('id', function ($subSelect) use ($warehouseId) {
                $subSelect->select('product_id')
                    ->from('warehouse_products')
                    ->where('warehouse_id', $warehouseId);
            })->selectSub(
                WarehouseProduct::select('stock')
                    ->where('warehouse_id', $warehouseId)
                    ->whereColumn('warehouse_products.product_id', 'products.id')
                    ->limit(1),
                'stock'
            );
        }
    }

    private function safePerPage($perPage): int
    {
        $perPage = (int) $perPage;

        return ($perPage >= 1 && $perPage <= 100) ? $perPage : 10;
    }
}
