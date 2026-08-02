<?php

namespace App\Repositories\Interface;

use App\DTOs\CreateUserData;
use App\DTOs\UpdateUserData;
use App\Models\User as UserModel;
use Illuminate\Database\Eloquent\Collection;

interface User
{
    /**
     * Get all users.
     *
     * @return Collection<int, UserModel>
     */
    public function all(): Collection;

    /**
     * Find user by ID.
     */
    public function findById(int $id): ?UserModel;

    /**
     * Create a new user.
     */
    public function create(CreateUserData $data, ?UserModel $actor = null): UserModel;

    /**
     * Update an existing user.
     */
    public function update(UserModel $user, UpdateUserData $data, ?UserModel $actor = null): UserModel;

    /**
     * Deactivate a user.
     */
    public function deactivate(UserModel $user, ?UserModel $actor = null): UserModel;

    /**
     * Set a temporary password for a user (offline reset).
     */
    public function setTemporaryPassword(UserModel $user, string $password, ?UserModel $actor = null): UserModel;
}
