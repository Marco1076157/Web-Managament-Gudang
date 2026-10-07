<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function getAll(array $fields, array $filters = []): LengthAwarePaginator;

    public function getById(int $id, array $fields): User;

    public function create(array $data): User;

    public function update(int $id, array $data): User;

    public function delete(int $id): void;
}
