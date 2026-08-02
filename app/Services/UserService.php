<?php

namespace App\Services;

use App\DTOs\CreateUserData;
use App\DTOs\UpdateUserData;
use App\Models\User as UserModel;
use App\Repositories\Interface\User as UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    /**
     * Get all users.
     *
     * @return Collection<int, UserModel>
     */
    public function getAllUsers(): Collection
    {
        return $this->userRepository->all();
    }

    /**
     * Find user by ID.
     */
    public function getUserById(int $id): ?UserModel
    {
        return $this->userRepository->findById($id);
    }

    /**
     * Create a new user.
     */
    public function createUser(CreateUserData $data, ?UserModel $actor = null): UserModel
    {
        return $this->userRepository->create($data, $actor);
    }

    /**
     * Update user details or role.
     */
    public function updateUser(UserModel $user, UpdateUserData $data, ?UserModel $actor = null): UserModel
    {
        return $this->userRepository->update($user, $data, $actor);
    }

    /**
     * Deactivate a user.
     */
    public function deactivateUser(UserModel $user, ?UserModel $actor = null): UserModel
    {
        return $this->userRepository->deactivate($user, $actor);
    }

    /**
     * Reset user password to a temporary password (offline reset).
     */
    public function resetTemporaryPassword(UserModel $user, string $temporaryPassword, ?UserModel $actor = null): UserModel
    {
        return $this->userRepository->setTemporaryPassword($user, $temporaryPassword, $actor);
    }
}
