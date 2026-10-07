<?php

namespace App\Repositories\Contracts;

use App\Models\WarehouseProduct;

interface WarehouseProductRepositoryInterface
{
    public function getByWarehouseAndProduct(int $warehouseId, int $productId): ?WarehouseProduct;
    public function updateStock(int $warehouseId, int $productId, int $stock): WarehouseProduct;
}