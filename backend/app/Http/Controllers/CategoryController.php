<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    //
    private $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index(Request $request)
    {
        $fields = ['id', 'name', 'slug', 'photo', 'tagline', 'created_at', 'updated_at'];
        $filters = $request->only(['search', 'per_page']);

        $categories = $this->categoryService->getAll($fields, $filters);

        return response()->json([
            'success' => true,
            'message' => 'Categories retrieved successfully',
            'data' => CategoryResource::collection($categories),
            'meta' => [
                'total' => $categories->total(),
                'per_page' => $categories->perPage(),
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
            ],
        ]);
    }

    public function show(int $id)
    {
        try {
            $fields = ['id', 'name', 'slug', 'tagline', 'icon', 'photo'];

            $category = $this->categoryService->getById($id, $fields);

            return response()->json([
                'success' => true,
                'message' => 'Category retrieved successfully',
                'data' => new CategoryResource($category),
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Category not found',
            ], 404);
        }
    }

    public function store(CategoryRequest $request)
    {
        $category = $this->categoryService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function update(CategoryRequest $request, int $id)
    {
        try {
            $category = $this->categoryService->update($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => new CategoryResource($category),
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Category not found',
            ], 404);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->categoryService->delete($id);

            return response()->json([
                'message' => 'Category deleted successfully',
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Category not found',
            ], 404);
        }
    }
}
