<?php

namespace App\Policies;

use App\Models\RequestType;
use App\Models\User;

class RequestTypePolicy
{
    /**
     * Viewing is open to any authenticated staff account (PLAN.md §3.5, §6.4).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, RequestType $requestType): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function update(User $user, RequestType $requestType): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function merge(User $user): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }
}
