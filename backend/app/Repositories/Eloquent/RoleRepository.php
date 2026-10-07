<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\RoleRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

class RoleRepository implements RoleRepositoryInterface
{
    public function getAll(array $fields): LengthAwarePaginator
    {
        return Role::select($fields)->withCount(['users'])->latest()->paginate(10);
    }

    public function getById(int $id, array $fields): Role
    {
        return Role::select($fields)->findOrFail($id);
    }

    public function create(array $data): Role
    {
        return Role::create($data);
    }

    public function update(int $id, array $data): Role
    {
        $role = Role::findOrFail($id);
        $role->update($data);

        return $role;
    }

    public function delete(int $id): void
    {
        $role = Role::findOrFail($id);
        $role->delete();
    }
}
