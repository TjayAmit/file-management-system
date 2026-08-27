<?php

namespace App\Policies;

use App\Models\User;

class AccessLogPolicy
{
    /**
     * Who opened which document is an accountability record, not an
     * operational one — admin-only, like the activity log (PLAN.md §3.5,
     * §6.6). It is a deterrent and a record, never a protection (§7.4).
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }
}
