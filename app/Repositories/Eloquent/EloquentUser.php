<?php

namespace App\Repositories\Eloquent;

use App\DTOs\CreateUserData;
use App\DTOs\UpdateUserData;
use App\Models\Activity;
use App\Models\User as UserModel;
use App\Repositories\Interface\User as UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Role;

class EloquentUser implements UserRepositoryInterface
{
    /**
     * Get all users.
     *
     * @return Collection<int, UserModel>
     */
    public function all(): Collection
    {
        return UserModel::all();
    }

    /**
     * Find user by ID.
     */
    public function findById(int $id): ?UserModel
    {
        return UserModel::find($id);
    }

    /**
     * Find user by email.
     */
    public function findByEmail(string $email): ?UserModel
    {
        return UserModel::where('email', $email)->first();
    }

    /**
     * Create a new user.
     */
    public function create(CreateUserData $data, ?UserModel $actor = null): UserModel
    {
        /** @var UserModel $user */
        $user = UserModel::create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => $data->password,
            'role' => $data->role,
            'is_active' => $data->isActive,
        ]);

        Role::findOrCreate($data->role, 'web');
        $user->syncRoles([$data->role]);

        Activity::create([
            'user_id' => $actor?->id,
            'subject_type' => UserModel::class,
            'subject_id' => $user->id,
            'action' => 'user.created',
            'details' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);

        return $user;
    }

    /**
     * Update an existing user.
     */
    public function update(UserModel $user, UpdateUserData $data, ?UserModel $actor = null): UserModel
    {
        $payload = array_filter([
            'name' => $data->name,
            'email' => $data->email,
            'role' => $data->role,
            'is_active' => $data->isActive,
            'password' => $data->password,
        ], fn ($val) => $val !== null);

        $loggedKeys = array_diff(array_keys($payload), ['password']);
        $before = $user->only($loggedKeys);

        $user->update($payload);

        if ($data->role !== null) {
            Role::findOrCreate($data->role, 'web');
            $user->syncRoles([$data->role]);
        }

        Activity::create([
            'user_id' => $actor?->id,
            'subject_type' => UserModel::class,
            'subject_id' => $user->id,
            'action' => 'user.updated',
            'details' => [
                'before' => $before,
                'after' => $user->only($loggedKeys),
            ],
        ]);

        return $user;
    }

    /**
     * Deactivate a user.
     */
    public function deactivate(UserModel $user, ?UserModel $actor = null): UserModel
    {
        $user->update(['is_active' => false]);

        Activity::create([
            'user_id' => $actor?->id,
            'subject_type' => UserModel::class,
            'subject_id' => $user->id,
            'action' => 'user.deactivated',
            'details' => null,
        ]);

        return $user;
    }

    /**
     * Set a temporary password for a user (offline reset).
     */
    public function setTemporaryPassword(UserModel $user, string $password, ?UserModel $actor = null): UserModel
    {
        $user->update(['password' => $password]);

        Activity::create([
            'user_id' => $actor?->id,
            'subject_type' => UserModel::class,
            'subject_id' => $user->id,
            'action' => 'user.password_reset',
            'details' => null,
        ]);

        return $user;
    }
}
