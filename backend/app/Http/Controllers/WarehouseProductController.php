<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarehouseProductUpdateRequest;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\WarehouseProduct;
use App\Services\StockAlertService;
use App\Services\WarehouseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseProductController extends Controller
{
    private WarehouseService $warehouseService;

    private StockAlertService $stockAlertService;

    public function __construct(WarehouseService $warehouseService, StockAlertService $stockAlertService)
    {
        $this->warehouseService = $warehouseService;
        $this->stockAlertService = $stockAlertService;
    }

    public function attach(Request $request, int $warehouseId): JsonResponse
    {

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'stock' => 'required|integer|min:1',
        ]);

        $this->warehouseService->attachProduct(
            $warehouseId,
            $request->input('product_id'),
            $request->input('stock')
        );

        return response()->json(['message' => 'Product attached successfully.']);
    }

    public function detach(int $warehouseId, int $productId)
    {
        $this->warehouseService->detachProduct($warehouseId, $productId);

        return response()->json(['message' => 'Product detached successfully.']);
    }

    public function update(WarehouseProductUpdateRequest $request, int $warehouseId, int $productId)
    {
        $warehouseProduct = $this->warehouseService->updateProductStock(
            $warehouseId,
            $productId,
            $request->validated()['stock']
        );

        $warehouse = Warehouse::find($warehouseId);
        if ($warehouse) {
            $product = Product::with('category')->find($productId);
            if ($product) {
                $currentStock = WarehouseProduct::where('warehouse_id', $warehouseId)
                    ->where('product_id', $productId)
                    ->value('stock') ?? $request->validated()['stock'];
                $this->stockAlertService->checkAndBroadcast(
                    $product,
                    'warehouse',
                    $warehouse->id,
                    $warehouse->name,
                    (int) $currentStock
                );
            }
        }

        return response()->json([
            'message' => 'Product stock updated successfully.',
            'data' => $warehouseProduct,
        ]);
    }
}
