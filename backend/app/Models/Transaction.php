<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = ['transaction_code', 'merchant_id', 'customer_name', 'customer_phone', 'total_amount', 'tax_amount', 'status'];

    public function merchant()
    {
        return $this->belongsTo(Merchant::class);
    }

    public function transactionProducts()
    {
        return $this->hasMany(TransactionProduct::class);
    }
}
