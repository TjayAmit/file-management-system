<?php

namespace App\Policies;

use App\Models\User;

class TransferPolicy
{
    /**
     * Updating physical location/status is an editor action (PLAN.md §6.4).
     */
    public function create(User $user): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }
}
