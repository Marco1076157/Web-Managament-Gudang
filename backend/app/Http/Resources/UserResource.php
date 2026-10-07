<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $roleNames = $this->getRoleNames();
        $firstRole = $this->roles->first();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'photo' => $this->photo,

            // Frontend membaca `user.role.name`, jadi `role` harus berupa
            // OBYEK, bukan string. Sebelumnya isinya nama role mentah
            // ("manager") sehingga `role?.name` selalu undefined.
            'role' => $firstRole ? [
                'id' => $firstRole->id,
                'name' => $firstRole->name,
            ] : null,

            // Tetap dipertahankan sebagai daftar nama agar konsumen lama
            // yang expects `user.roles[0]` sebagai string tidak rusak.
            'roles' => $roleNames,
            'role_id' => $firstRole?->id,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Kolom "Merchant" di tabel user membutuhkan nama merchant yang
            // di-keeper user ini. Tanpa ini frontend selalu menampilkan "-".
            'merchant' => $this->merchants ? [
                'id' => $this->merchants->id,
                'name' => $this->merchants->name,
            ] : null,
        ];
    }
}
