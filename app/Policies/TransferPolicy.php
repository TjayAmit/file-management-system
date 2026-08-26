<?php

namespace App\Policies;

use App\Models\User;

class TransferPolicy
{
    /**
     * The transfer log is part of knowing where the paper is, so any staff
     * account may read it (PLAN.md 3.5).
     */
    public function viewAny(User $user): bool
    {
        return $user->isViewer() || $user->isEditor() || $user->isAdmin();
    }

    /**
     * Updating physical location/status is an editor action (PLAN.md 6.4).
     */
    public function create(User $user): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }
}
