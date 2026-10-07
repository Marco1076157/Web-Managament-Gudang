<?php

namespace App\Repositories\Contracts;

use Spatie\Permission\Models\Role;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface RoleRepositoryInterface
{
    public function getAll(array $fields): LengthAwarePaginator;
    public function getById(int $id, array $fields): Role;
    public function create(array $data): Role;
    public function update(int $id, array $data): Role;
    public function delete(int $id): void;
}