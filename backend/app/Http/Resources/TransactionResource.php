<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_code' => $this->transaction_code,
            'merchant_id' => $this->merchant_id,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'total_amount' => $this->total_amount,
            'tax_amount' => (int) ($this->tax_amount ?? 0),
            'status' => $this->status,
            'merchant' => $this->whenLoaded('merchant'),
            'items' => TransactionProductResource::collection($this->whenLoaded('transactionProducts')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
