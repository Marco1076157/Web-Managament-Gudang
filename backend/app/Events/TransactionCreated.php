<?php

namespace App\Events;

use App\Models\Transaction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Transaction $transaction)
    {
        //
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('managers'),
        ];
    }

    public function broadcastWith(): array
    {
        $this->transaction->loadMissing(['merchant', 'transactionProducts.product']);

        return [
            'id' => $this->transaction->id,
            'invoice_number' => $this->transaction->invoice_number,
            'total' => $this->transaction->total,
            'payment_method' => $this->transaction->payment_method,
            'status' => $this->transaction->status,
            'merchant' => $this->transaction->merchant ? [
                'id' => $this->transaction->merchant->id,
                'name' => $this->transaction->merchant->name,
            ] : null,
            'items_count' => $this->transaction->transactionProducts->count(),
            'products' => $this->transaction->transactionProducts->map(function ($tp) {
                return [
                    'name' => $tp->product?->name,
                    'quantity' => $tp->quantity,
                    'price' => $tp->price,
                ];
            }),
            'created_at' => $this->transaction->created_at,
        ];
    }

    public function broadcastAs(): string
    {
        return 'transaction.created';
    }
}
