<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LowStockWarning implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  array  $payload
     *                          [
     *                          'product_id','product_name','thumbnail','category_name',
     *                          'location_type'=>'merchant|warehouse','location_id','location_name',
     *                          'current_stock','min_stock','threshold'
     *                          ]
     */
    public function __construct(public array $payload)
    {
        //
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('managers'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'stock.low';
    }
}
