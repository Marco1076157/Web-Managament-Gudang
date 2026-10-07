<?php

namespace App\Models;

use App\Models\Concerns\ResolvesPublicFileUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use ResolvesPublicFileUrl;
    use SoftDeletes;

    protected $fillable = ['name', 'address', 'photo', 'phone'];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'warehouse_products')
            ->withPivot('stock')
            ->withTimestamps();
    }

    // Kolomnya bernama `photo`, bukan `thumbnail` — accessor harus sama dengan
    // nama kolom agar file URL benar-benar dikonversi.
    public function getPhotoAttribute($value)
    {
        return $this->publicFileUrl($value);
    }
}
