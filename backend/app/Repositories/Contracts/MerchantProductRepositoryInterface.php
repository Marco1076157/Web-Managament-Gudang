<?php

namespace App\Repositories\Contracts;

use App\Models\MerchantProduct;

interface MerchantProductRepositoryInterface
{
    public function create(array $data): MerchantProduct;
    public function getByMerchantAndProduct(int $merchantId, int $productId): ?MerchantProduct;
    public function updateStock(int $merchantId, int $productId, int $stock): MerchantProduct;
}