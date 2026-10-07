<?php

namespace App\Services;

use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    private ProductRepositoryInterface $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function getAll(array $fields, array $filters = [])
    {
        return $this->productRepository->getAll($fields, $filters);
    }

    public function getById(int $id, array $fields)
    {
        return $this->productRepository->getById($id, $fields ?? ['*']);
    }

    public function create(array $data)
    {
        if (isset($data['thumbnail']) && $data['thumbnail'] instanceof UploadedFile) {
            $data['thumbnail'] = $this->uploadPhoto($data['thumbnail']);
        }

        return $this->productRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        $fields = ['id', 'thumbnail'];

        $product = $this->productRepository->getById($id, $fields);

        if (isset($data['thumbnail']) && $data['thumbnail'] instanceof UploadedFile) {
            if (! empty($product->thumbnail)) {
                $this->deletePhoto($product->thumbnail);
            }
            $data['thumbnail'] = $this->uploadPhoto($data['thumbnail']);
        }

        return $this->productRepository->update($id, $data);
    }

    public function delete(int $id)
    {
        $fields = ['id', 'thumbnail'];

        $product = $this->productRepository->getById($id, $fields);

        if (! empty($product->thumbnail)) {
            $this->deletePhoto($product->thumbnail);
        }

        $this->productRepository->delete($id);
    }

    private function uploadPhoto(UploadedFile $photo)
    {
        return $photo->store('products', 'public');
    }

    private function deletePhoto(string $photoPath)
    {
        $relativePath = 'products/'.basename($photoPath);
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }
}
