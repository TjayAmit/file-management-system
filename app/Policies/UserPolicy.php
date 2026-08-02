<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Account administration — creating accounts, assigning roles, resetting
     * passwords, deactivating users — is admin-only (PLAN.md §6.4, §6.5).
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $target): bool
    {
        return $user->isAdmin();
    }

    public function deactivate(User $user, User $target): bool
    {
        return $user->isAdmin();
    }

    public function resetPassword(User $user, User $target): bool
    {
        return $user->isAdmin();
    }
}
