<?php

namespace App\Policies;

use App\Models\DeletionRequest;
use App\Models\User;

class DeletionRequestPolicy
{
    /**
     * Editors file deletion requests and admins decide them, so both need to
     * read the queue. A viewer changes nothing and has no business there.
     */
    public function viewAny(User $user): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    /**
     * Approving/rejecting a deletion request is the office head's decision --
     * admin-only (PLAN.md 6.4, 6.7).
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
