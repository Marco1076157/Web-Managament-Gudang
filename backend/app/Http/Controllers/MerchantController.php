<?php

namespace App\Http\Controllers;

use App\Http\Requests\MerchantRequest;
use App\Http\Resources\MerchantResource;
use App\Http\Resources\ProductResource;
use App\Services\MerchantService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MerchantController extends Controller
{
    //
    private $merchantService;

    public function __construct(MerchantService $merchantService)
    {
        $this->merchantService = $merchantService;
    }

    public function index(Request $request)
    {
        $fields = ['id', 'name', 'address', 'phone', 'photo', 'keeper_id', 'created_at', 'updated_at'];
        $filters = $request->only(['search', 'keeper_id', 'per_page']);

        $merchants = $this->merchantService->getAll($fields, $filters);

        return response()->json([
            'success' => true,
            'message' => 'Merchants retrieved successfully',
            'data' => MerchantResource::collection($merchants),
            'meta' => [
                'total' => $merchants->total(),
                'per_page' => $merchants->perPage(),
                'current_page' => $merchants->currentPage(),
                'last_page' => $merchants->lastPage(),
            ],
        ]);
    }

    public function show(int $id)
    {
        try {
            $fields = ['id', 'name', 'address', 'phone', 'photo', 'keeper_id'];

            $merchant = $this->merchantService->getById($id, $fields);

            return response()->json([
                'success' => true,
                'message' => 'Merchant retrieved successfully',
                'data' => new MerchantResource($merchant),
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Merchant not found',
            ], 404);
        }
    }

    public function store(MerchantRequest $request)
    {
        $merchant = $this->merchantService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Merchant created successfully',
            'data' => new MerchantResource($merchant),
        ], 201);
    }

    public function update(MerchantRequest $request, int $id)
    {
        try {
            $merchant = $this->merchantService->update($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Merchant updated successfully',
                'data' => new MerchantResource($merchant),
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Merchant not found',
            ], 404);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->merchantService->delete($id);

            return response()->json([
                'message' => 'Merchant deleted successfully',
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Merchant not found',
            ], 404);
        }
    }

    public function getMyMerchantProfile()
    {

        $userId = Auth::id();

        try {
            $merchant = $this->merchantService->getByKeeperId($userId);

            return response()->json(new MerchantResource($merchant));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Merchant not found for this user.',
            ], 404);
        }
    }

    /**
     * Daftar produk + stok yang sudah didistribusikan ke merchant
     * (beserta id gudang asal pada pivot).
     */
    public function products(int $id)
    {
        try {
            $products = $this->merchantService->getProducts($id);

            return response()->json([
                'success' => true,
                'message' => 'Merchant products retrieved successfully',
                'data' => ProductResource::collection($products),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Merchant not found',
            ], 404);
        }
    }
}
