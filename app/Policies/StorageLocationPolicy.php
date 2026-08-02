<?php

namespace App\Policies;

use App\Models\StorageLocation;
use App\Models\User;

class StorageLocationPolicy
{
    /**
     * Viewing is open to any authenticated staff account (PLAN.md §3.5, §6.4).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, StorageLocation $storageLocation): bool
    {
        return true;
    }

    /**
     * Maintaining the storage-location vocabulary is admin-only (PLAN.md §6.4).
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, StorageLocation $storageLocation): bool
    {
        return $user->isAdmin();
    }
}
