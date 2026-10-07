<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'thumbnail' => $this->thumbnail,
            'about' => $this->about,
            'price' => $this->price,
            'category_id' => $this->category_id,
            'is_popular' => $this->is_popular,
            'category' => new CategoryResource($this->whenLoaded('category')),
            // Stok hanya ikut bila data diambil per konteks stok (merchant/warehouse),
            // mis. `products?merchant_id=1` atau daftar produk pada halaman merchant/gudang.
            'stock' => $this->when(isset($this->stock) || $this->pivot !== null, fn () => (int) ($this->stock ?? $this->pivot->stock ?? 0)),
            // Asal stok merchant (pivot merchant_products.warehouse_id).
            'warehouse_id' => $this->when($this->pivot !== null && isset($this->pivot->warehouse_id), fn () => (int) $this->pivot->warehouse_id),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
