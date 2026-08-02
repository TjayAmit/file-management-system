<?php

namespace App\Services;

use App\DTOs\CreateBranchData;
use App\DTOs\MergeBranchData;
use App\DTOs\ReparentBranchData;
use App\DTOs\UpdateBranchData;
use App\Models\Branch as BranchModel;
use App\Models\User;
use App\Repositories\Interface\Branch as BranchRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class BranchService
{
    public function __construct(
        private readonly BranchRepositoryInterface $branchRepository,
    ) {}

    /**
     * Get all branches.
     *
     * @return Collection<int, BranchModel>
     */
    public function getAllBranches(): Collection
    {
        return $this->branchRepository->all();
    }

    /**
     * Search branches by business ID and/or location query.
     *
     * @return Collection<int, BranchModel>
     */
    public function searchBranches(?int $businessId = null, string $query = ''): Collection
    {
        return $this->branchRepository->search($businessId, $query);
    }

    /**
     * Find branch by ID.
     */
    public function getBranchById(int $id): ?BranchModel
    {
        return $this->branchRepository->findById($id);
    }

    /**
     * Create a new branch.
     */
    public function createBranch(CreateBranchData $data, ?User $user = null): BranchModel
    {
        return $this->branchRepository->create($data, $user);
    }

    /**
     * Update an existing branch.
     */
    public function updateBranch(BranchModel $branch, UpdateBranchData $data, ?User $user = null): BranchModel
    {
        return $this->branchRepository->update($branch, $data, $user);
    }

    /**
     * Re-parent a branch to a new business.
     */
    public function reparentBranch(ReparentBranchData $data, ?User $user = null): BranchModel
    {
        return $this->branchRepository->reparent($data, $user);
    }

    /**
     * Merge source branch into target branch.
     */
    public function mergeBranches(MergeBranchData $data, ?User $user = null): BranchModel
    {
        return $this->branchRepository->merge($data, $user);
    }
}
