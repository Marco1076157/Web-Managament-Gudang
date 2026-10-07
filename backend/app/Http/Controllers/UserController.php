<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class UserController extends Controller
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index()
    {
        // created_at wajib ikut karena kolom "Dibuat" di tabel user memakainya.
        $fields = ['id', 'name', 'email', 'phone', 'photo', 'created_at', 'updated_at'];

        $filters = [
            'search' => request('search'),
            'role' => request('role'),
            'per_page' => request('per_page'),
        ];

        $users = $this->userService->getAll($fields, $filters);

        return response()->json([
            'success' => true,
            'message' => 'Users retrieved successfully',
            'data' => UserResource::collection($users),
            'meta' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function show(int $id)
    {
        try {
            $fields = ['*'];
            $user = $this->userService->getById($id, $fields);

            return response()->json([
                'success' => true,
                'message' => 'User retrieved successfully',
                'data' => new UserResource($user),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }
    }

    public function store(UserRequest $request)
    {
        $data = $request->validated();
        $data['photo'] = $this->handlePhotoUpload($request);

        $user = $this->userService->create($data);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => new UserResource($user),
        ], 201);
    }

    public function update(UserRequest $request, int $id)
    {
        try {
            $data = $request->validated();
            $photoPath = $this->handlePhotoUpload($request);

            if ($photoPath !== null) {
                $data['photo'] = $photoPath;
            } else {
                unset($data['photo']);
            }

            $user = $this->userService->update($id, $data);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => new UserResource($user),
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->userService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }
    }

    /**
     * Handle photo upload if present in request.
     * Returns the stored path or null if no file uploaded.
     */
    private function handlePhotoUpload(Request $request): ?string
    {
        if (! $request->hasFile('photo')) {
            return null;
        }

        $file = $request->file('photo');
        $path = $file->store('users', 'public');

        return $path;
    }
}
