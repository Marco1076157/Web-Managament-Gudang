<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarehouseRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\WarehouseResource;
use App\Services\WarehouseService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    //

    private WarehouseService $warehouseService;

    public function __construct(WarehouseService $warehouseService)
    {
        $this->warehouseService = $warehouseService;
    }

    public function index(Request $request)
    {
        $fields = ['id', 'name', 'address', 'photo', 'phone'];
        $filters = $request->only(['search', 'per_page']);

        $warehouses = $this->warehouseService->getAll($fields, $filters);

        return response()->json([
            'success' => true,
            'message' => 'Warehouses retrieved successfully',
            'data' => WarehouseResource::collection($warehouses),
            'meta' => [
                'total' => $warehouses->total(),
                'per_page' => $warehouses->perPage(),
                'current_page' => $warehouses->currentPage(),
                'last_page' => $warehouses->lastPage(),
            ],
        ]);
    }

    public function show(int $id)
    {
        try {
            $fields = ['id', 'name', 'address', 'phone', 'photo'];

            $warehouse = $this->warehouseService->getById($id, $fields);

            return response()->json([
                'success' => true,
                'message' => 'Warehouse retrieved successfully',
                'data' => new WarehouseResource($warehouse),
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Warehouse not found',
            ], 404);
        }
    }

    /**
     * Daftar produk + stok yang dititipkan di gudang.
     */
    public function products(int $id)
    {
        try {
            $products = $this->warehouseService->getProducts($id);

            return response()->json([
                'success' => true,
                'message' => 'Warehouse products retrieved successfully',
                'data' => ProductResource::collection($products),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Warehouse not found',
            ], 404);
        }
    }

    public function store(WarehouseRequest $request)
    {
        $warehouse = $this->warehouseService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Warehouse created successfully',
            'data' => new WarehouseResource($warehouse),
        ], 201);
    }

    public function update(WarehouseRequest $request, int $id)
    {
        try {
            $warehouse = $this->warehouseService->update($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Warehouse updated successfully',
                'data' => new WarehouseResource($warehouse),
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Warehouse not found',
            ], 404);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->warehouseService->delete($id);

            return response()->json([
                'message' => 'Warehouse deleted successfully',
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Warehouse not found',
            ], 404);
        }
    }
}
