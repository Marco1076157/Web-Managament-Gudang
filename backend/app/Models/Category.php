<?php

namespace App\Models;

use App\Models\Concerns\ResolvesPublicFileUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use ResolvesPublicFileUrl;
    use SoftDeletes;

    protected $fillable = ['name', 'slug', 'icon', 'photo', 'tagline'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Kolomnya bernama `photo`, bukan `thumbnail`. Accessor WAJIB cocok
    // dengan nama kolom, kalau tidak file URL tidak pernah dikonversi dan API
    // mengembalikan path relatif yang tidak bisa dirender browser.
    public function getPhotoAttribute($value)
    {
        return $this->publicFileUrl($value);
    }
}
