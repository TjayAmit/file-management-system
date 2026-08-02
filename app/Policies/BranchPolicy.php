<?php

namespace App\Policies;

use App\Models\Branch;
use App\Models\User;

class BranchPolicy
{
    /**
     * Viewing is open to any authenticated staff account (PLAN.md §3.5, §6.4).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Branch $branch): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function update(User $user, Branch $branch): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function reparent(User $user, Branch $branch): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function merge(User $user): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }
}
