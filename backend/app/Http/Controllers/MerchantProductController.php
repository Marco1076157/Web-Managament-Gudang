<?php

namespace App\Http\Controllers;

use App\Http\Requests\MerchantProductRequest;
use App\Http\Requests\MerchantProductUpdateRequest;
use App\Models\Merchant;
use App\Models\MerchantProduct;
use App\Models\Product;
use App\Services\MerchantProductService;
use App\Services\StockAlertService;

class MerchantProductController extends Controller
{
    private MerchantProductService $merchantProductService;

    private StockAlertService $stockAlertService;

    public function __construct(MerchantProductService $merchantProductService, StockAlertService $stockAlertService)
    {
        $this->merchantProductService = $merchantProductService;
        $this->stockAlertService = $stockAlertService;
    }

    public function store(MerchantProductRequest $request, int $merchant)
    {
        $validated = $request->validated();
        $validated['merchant_id'] = $merchant;

        $merchantProduct = $this->merchantProductService->assignProductToMerchant($validated);

        return response()->json([
            'message' => 'Product assigned to merchant successfully',
            'data' => $merchantProduct,
        ], 201);
    }

    public function update(MerchantProductUpdateRequest $request, int $merchantId, int $productId)
    {
        $validated = $request->validated();

        $merchantProduct = $this->merchantProductService->updateStock(
            $merchantId,
            $productId,
            $validated['stock'],
            $validated['warehouse_id']
        );

        $merchant = Merchant::find($merchantId);
        if ($merchant) {
            $product = Product::with('category')->find($productId);
            if ($product) {
                $currentStock = MerchantProduct::where('merchant_id', $merchantId)
                    ->where('product_id', $productId)
                    ->value('stock') ?? $validated['stock'];
                $this->stockAlertService->checkAndBroadcast(
                    $product,
                    'merchant',
                    $merchant->id,
                    $merchant->name,
                    (int) $currentStock
                );
            }
        }

        return response()->json([
            'message' => 'Stock updated successfully',
            'data' => $merchantProduct,
        ]);
    }

    public function destroy(int $merchant, int $product)
    {
        $this->merchantProductService->removeProductFromMerchant($merchant, $product);

        return response()->json([
            'message' => 'Product removed from merchant successfully',
        ]);
    }
}
