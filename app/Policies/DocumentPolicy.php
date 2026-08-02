<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    /**
     * Search, view, download, and print are open to any authenticated staff
     * account (PLAN.md §3.5, §6.4) — access is logged separately at the
     * point the PDF is served, not gated by role.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Document $document): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function update(User $user, Document $document): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function updateLocation(User $user, Document $document): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function revert(User $user, Document $document): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function replaceFile(User $user, Document $document): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function revertFileVersion(User $user, Document $document): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }

    public function requestDeletion(User $user, Document $document): bool
    {
        return $user->isEditor() || $user->isAdmin();
    }
}
