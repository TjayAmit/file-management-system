<?php

namespace App\Repositories\Interface;

use App\DTOs\CreateBranchData;
use App\DTOs\MergeBranchData;
use App\DTOs\ReparentBranchData;
use App\DTOs\UpdateBranchData;
use App\Models\Branch as BranchModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface Branch
{
    /**
     * Get all branches.
     *
     * @return Collection<int, BranchModel>
     */
    public function all(): Collection;

    /**
     * Search/suggest branches for a given business or location query.
     *
     * @return Collection<int, BranchModel>
     */
    public function search(?int $businessId = null, string $query = ''): Collection;

    /**
     * Find a branch by ID.
     */
    public function findById(int $id): ?BranchModel;

    /**
     * Create a new branch.
     */
    public function create(CreateBranchData $data): BranchModel;

    /**
     * Update an existing branch.
     */
    public function update(BranchModel $branch, UpdateBranchData $data): BranchModel;

    /**
     * Re-parent a branch to another business.
     * If a collision occurs (branch with same location exists under target business),
     * merges source branch into target branch.
     */
    public function reparent(ReparentBranchData $data, ?User $user = null): BranchModel;

    /**
     * Merge source branch into target branch (documents re-pointed, source soft deleted, logged).
     */
    public function merge(MergeBranchData $data, ?User $user = null): BranchModel;
}
