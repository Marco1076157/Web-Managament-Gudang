<?php

namespace App\Services;

use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CategoryService
{
    private CategoryRepositoryInterface $categoryRepository;

    public function __construct(CategoryRepositoryInterface $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function getAll(array $fields, array $filters = [])
    {
        return $this->categoryRepository->getAll($fields, $filters);
    }

    public function getById(int $id, array $fields)
    {
        return $this->categoryRepository->getById($id, $fields ?? ['*']);
    }

    public function create(array $data)
    {
        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            $data['photo'] = $this->uploadPhoto($data['photo']);
        }

        return $this->categoryRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        $fields = ['id', 'photo'];

        $category = $this->categoryRepository->getById($id, $fields);

        if (isset($data['photo']) && $data['photo'] instanceof UploadedFile) {
            if (! empty($category->photo)) {
                $this->deletePhoto($category->photo);
            }
            $data['photo'] = $this->uploadPhoto($data['photo']);
        }

        return $this->categoryRepository->update($id, $data);
    }

    public function delete(int $id)
    {
        $fields = ['id', 'photo'];

        $category = $this->categoryRepository->getById($id, $fields);

        if ($category->photo) {
            $this->deletePhoto($category->photo);
        }

        $this->categoryRepository->delete($id);
    }

    private function uploadPhoto(UploadedFile $photo)
    {
        return $photo->store('categories', 'public');
    }

    private function deletePhoto(string $photoPath)
    {
        $relativePath = 'categories/'.basename($photoPath);
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
