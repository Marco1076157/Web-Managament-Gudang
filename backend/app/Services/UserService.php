<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;

class UserService
{
    private UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getAll(array $fields, array $filters = [])
    {
        return $this->userRepository->getAll($fields, $filters);
    }

    public function getById(int $id, array $fields)
    {
        return $this->userRepository->getById($id, $fields);
    }

    public function create(array $data)
    {
        return $this->userRepository->create($data);
    }

    public function update(int $id, array $data)
    {
        return $this->userRepository->update($id, $data);
    }

    public function delete(int $id)
    {
        $this->userRepository->delete($id);
    }
}
