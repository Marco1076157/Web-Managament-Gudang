<?php

namespace App\Repositories\Contracts;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CategoryRepositoryInterface
{
    public function getAll(array $fields, array $filters = []): LengthAwarePaginator;

    public function getById(int $id, array $fields): Category;

    public function create(array $data): Category;

    public function update(int $id, array $data): Category;

    public function delete(int $id): void;
}
