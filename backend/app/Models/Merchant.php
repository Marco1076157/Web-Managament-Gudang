<?php

namespace App\Models;

use App\Models\Concerns\ResolvesPublicFileUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Merchant extends Model
{
    use ResolvesPublicFileUrl;
    use SoftDeletes;

    protected $fillable = ['name', 'address', 'photo', 'phone', 'keeper_id'];

    public function keeper()
    {
        return $this->belongsTo(User::class, 'keeper_id');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'merchant_products')
            ->withPivot('stock')
            ->withPivot('warehouse_id')
            ->withTimestamps();
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Kolomnya bernama `photo`, bukan `thumbnail` — accessor harus sama dengan
    // nama kolom agar file URL benar-benar dikonversi.
    public function getPhotoAttribute($value)
    {
        return $this->publicFileUrl($value);
    }
}
