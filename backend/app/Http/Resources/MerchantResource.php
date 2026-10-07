<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MerchantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'phone' => $this->phone,
            'photo' => $this->photo,
            'keeper_id' => $this->keeper_id,
            'keeper' => new UserResource($this->whenLoaded('keeper')),
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'products_count' => (int) ($this->products_count ?? 0),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
