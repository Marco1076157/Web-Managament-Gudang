<?php

namespace App\Repositories\Eloquent;

use App\Models\WarehouseProduct;
use App\Repositories\Contracts\WarehouseProductRepositoryInterface;

class WarehouseProductRepository implements WarehouseProductRepositoryInterface
{
    public function getByWarehouseAndProduct(int $warehouseId, int $productId): ?WarehouseProduct
    {
        return WarehouseProduct::where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->first();
    }

    public function updateStock(int $warehouseId, int $productId, int $stock): WarehouseProduct
    {
        $warehouseProduct = $this->getByWarehouseAndProduct($warehouseId, $productId);

        if (!$warehouseProduct) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'product_id' => ['Product not found for this warehouse.']
            ]);
        }

        $warehouseProduct->update(['stock' => $stock]);
        return $warehouseProduct;
    }
}