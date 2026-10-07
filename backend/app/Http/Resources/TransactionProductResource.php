<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'qty' => $this->quantity,
            'price' => $this->price,
            'subtotal' => $this->sub_total,
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}