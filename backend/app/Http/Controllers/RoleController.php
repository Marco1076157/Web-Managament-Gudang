<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;
use App\Services\RoleService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class RoleController extends Controller
{
    private RoleService $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    public function index()
    {
        $fields = ['id', 'name', 'guard_name', 'created_at', 'updated_at'];
        $roles = $this->roleService->getAll($fields);

        return response()->json([
            'success' => true,
            'message' => 'Roles retrieved successfully',
            'data' => RoleResource::collection($roles),
            'meta' => [
                'total' => $roles->total(),
                'per_page' => $roles->perPage(),
                'current_page' => $roles->currentPage(),
                'last_page' => $roles->lastPage(),
            ],
        ]);
    }

    public function show(int $id)
    {
        try {
            $fields = ['*'];
            $role = $this->roleService->getById($id, $fields);

            return response()->json([
                'success' => true,
                'message' => 'Role retrieved successfully',
                'data' => new RoleResource($role),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }
    }

    public function store(RoleRequest $request)
    {
        $role = $this->roleService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'data' => new RoleResource($role),
        ], 201);
    }

    public function update(RoleRequest $request, int $id)
    {
        try {
            $role = $this->roleService->update($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Role updated successfully',
                'data' => new RoleResource($role),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->roleService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }
    }
}
