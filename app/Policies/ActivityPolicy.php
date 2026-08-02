<?php

namespace App\Policies;

use App\Models\User;

class ActivityPolicy
{
    /**
     * The activity log is an accountability tool for the office head —
     * admin-only (PLAN.md §3.5, §6.4).
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }
}
