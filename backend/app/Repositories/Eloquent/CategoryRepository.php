<?php

namespace App\Repositories\Eloquent;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoryRepository implements CategoryRepositoryInterface
{
    public function getAll(array $fields, array $filters = []): LengthAwarePaginator
    {
        $perPage = $this->safePerPage($filters['per_page'] ?? null);

        $query = Category::select($fields ?: ['*'])
            ->withCount('products')
            ->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    public function getById(int $id, array $fields): Category
    {
        return Category::select($fields ?: ['*'])->findOrFail($id);
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function update(int $id, array $data): Category
    {
        $category = Category::findOrFail($id);
        $category->update($data);

        return $category;
    }

    public function delete(int $id): void
    {
        $category = Category::findOrFail($id);
        $category->delete();
    }

    private function applyFilters($query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('tagline', 'like', "%{$search}%");
            });
        }
    }

    private function safePerPage($perPage): int
    {
        $perPage = (int) $perPage;

        return ($perPage >= 1 && $perPage <= 100) ? $perPage : 10;
    }
}
