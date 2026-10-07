<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserRepository implements UserRepositoryInterface
{
    public function getAll(array $fields, array $filters = []): LengthAwarePaginator
    {
        $perPage = $this->safePerPage($filters['per_page'] ?? null);

        $query = User::select($fields ?: ['*'])
            ->with(['roles', 'merchants:id,name,keeper_id'])
            ->latest();

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    public function getById(int $id, array $fields): User
    {
        return User::select($fields ?: ['*'])
            ->with(['roles', 'merchants'])
            ->findOrFail($id);
    }

    public function create(array $data): User
    {
        // role_id bukan kolom pada tabel users (relasi many-to-many lewat
        // Spatie), jadi harus dipisah sebelum create dan dipasang terpisah.
        $roleId = $data['role_id'] ?? null;
        unset($data['role_id']);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user = User::create($data);

        $this->syncRole($user, $roleId);

        return $user->load('roles');
    }

    public function update(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        $roleId = $data['role_id'] ?? null;
        unset($data['role_id']);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        // null dibuang supaya kolom nullable tidak ditimpa string kosong.
        $user->update(array_filter($data, fn ($value) => $value !== null));

        // Hanya sentuh role bila request memang menyertakan role_id,
        // supaya edit biasa tidak diam-diam mencabut role user.
        if ($roleId !== null) {
            $this->syncRole($user, $roleId);
        }

        return $user->load('roles');
    }

    public function delete(int $id): void
    {
        $user = User::findOrFail($id);
        $user->delete();
    }

    private function applyFilters($query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['role'])) {
            $query->whereHas('roles', function ($q) use ($filters) {
                $q->where('name', $filters['role']);
            });
        }
    }

    private function safePerPage($perPage): int
    {
        $perPage = (int) $perPage;

        return ($perPage >= 1 && $perPage <= 100) ? $perPage : 10;
    }

    /**
     * Ganti role user (sync = replace, bukan append).
     *
     * Frontend mengirim role_id numerik dari <select>, tapi endpoint lama
     * pernah mengirim nama role, jadi dua-duanya diterima.
     */
    private function syncRole(User $user, int|string|null $roleIdOrName): void
    {
        if ($roleIdOrName === null || $roleIdOrName === '') {
            return;
        }

        $role = is_numeric($roleIdOrName)
            ? Role::find($roleIdOrName)
            : Role::where('name', $roleIdOrName)->first();

        if ($role) {
            $user->syncRoles([$role]);
        }
    }
}
