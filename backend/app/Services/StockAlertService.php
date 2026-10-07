<?php

namespace App\Services;

use App\Events\LowStockWarning;
use App\Models\Product;

class StockAlertService
{
    public const DEFAULT_MIN_STOCK = 5;

    public const DEFAULT_THRESHOLD = 5;

    /**
     * Evaluasi stok produk di lokasi tertentu dan broadcast jika <= min/threshold
     */
    public function checkAndBroadcast(Product $product, string $locationType, int $locationId, string $locationName, int $currentStock, ?int $minStock = null, ?int $threshold = null): bool
    {
        $min = $minStock ?? self::DEFAULT_MIN_STOCK;
        $th = $threshold ?? self::DEFAULT_THRESHOLD;

        if ($currentStock <= $min) {
            broadcast(new LowStockWarning([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'thumbnail' => $product->thumbnail,
                'category_name' => $product->category?->name,
                'location_type' => $locationType,
                'location_id' => $locationId,
                'location_name' => $locationName,
                'current_stock' => $currentStock,
                'min_stock' => $min,
                'threshold' => $th,
            ]));

            return true;
        }

        return false;
    }
}
