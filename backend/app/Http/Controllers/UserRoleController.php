<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
{
    /**
     * Assign (ganti) role untuk satu user.
     *
     * Mendukung dua pemanggilan:
     *  1. PUT /api/users/{user}/role  body: { role_id }   -> $user dari route
     *  2. POST /api/users/roles       body: { user_id, role_id }  -> legacy
     *
     * @param  User|null  $user  user dari route parameter (opsional)
     */
    public function assignRole(UserRoleRequest $request, ?User $user = null)
    {
        // Kalau dipanggil via route, pakai user dari route.
        // Kalau dipanggil via endpoint legacy, ambil dari body.
        $user ??= User::findOrFail($request->input('user_id'));

        $role = Role::findOrFail($request->input('role_id'));

        // syncRoles() = REPLACE, bukan append.
        // assignRole() akan menambah role baru tanpa menghapus role lama,
        // sehingga user bisa punya 2 role dan UI "satu role per user" jadi ambigu.
        $user->syncRoles([$role]);

        $user->load('roles');

        return response()->json([
            'success' => true,
            'message' => 'Role assigned successfully',
            'data' => new UserResource($user),
        ]);
    }
}
