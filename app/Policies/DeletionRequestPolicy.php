<?php

namespace App\Policies;

use App\Models\DeletionRequest;
use App\Models\User;

class DeletionRequestPolicy
{
    /**
     * Approving/rejecting a deletion request is the office head's decision —
     * admin-only (PLAN.md §6.4, §6.7).
     */
    public function approve(User $user, DeletionRequest $deletionRequest): bool
    {
        return $user->isAdmin();
    }

    public function reject(User $user, DeletionRequest $deletionRequest): bool
    {
        return $user->isAdmin();
    }
}
