<?php

namespace App\Repositories\Eloquent;

use App\Models\MerchantProduct;
use App\Repositories\Contracts\MerchantProductRepositoryInterface;

class MerchantProductRepository implements MerchantProductRepositoryInterface
{
    public function create(array $data): MerchantProduct
    {
        return MerchantProduct::create($data);
    }

    public function getByMerchantAndProduct(int $merchantId, int $productId): ?MerchantProduct
    {
        return MerchantProduct::where('merchant_id', $merchantId)
            ->where('product_id', $productId)
            ->first();
    }

    public function updateStock(int $merchantId, int $productId, int $stock): MerchantProduct
    {
        $merchantProduct = $this->getByMerchantAndProduct($merchantId, $productId);

        if (!$merchantProduct) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'product_id' => ['Product not found for this merchant.']
            ]);
        }

        $merchantProduct->update(['stock' => $stock]);
        return $merchantProduct;
    }
}