<?php

namespace App\Repositories\Eloquent;

use App\DTOs\CreateBranchData;
use App\DTOs\MergeBranchData;
use App\DTOs\ReparentBranchData;
use App\DTOs\UpdateBranchData;
use App\Models\Activity;
use App\Models\Branch as BranchModel;
use App\Models\User;
use App\Repositories\Interface\Branch as BranchRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentBranch implements BranchRepositoryInterface
{
    /**
     * Get all branches.
     *
     * @return Collection<int, BranchModel>
     */
    public function all(): Collection
    {
        return BranchModel::with(['business', 'documents'])->get();
    }

    /**
     * Search/suggest branches for a given business or location query.
     *
     * @return Collection<int, BranchModel>
     */
    public function search(?int $businessId = null, string $query = ''): Collection
    {
        $builder = BranchModel::query()->with('business');

        if ($businessId !== null) {
            $builder->where('business_id', $businessId);
        }

        if (trim($query) !== '') {
            $builder->where('location', 'like', '%'.$query.'%');
        }

        return $builder->limit(15)->get();
    }

    /**
     * Search branches by location/address for the address-first entry point
     * (PLAN.md §3.2), with each branch's business and encoded documents loaded.
     *
     * @return Collection<int, BranchModel>
     */
    public function searchByLocation(string $location): Collection
    {
        if (trim($location) === '') {
            return new Collection;
        }

        return BranchModel::where('location', 'like', '%'.$location.'%')
            ->with([
                'business',
                'documents' => function ($query) {
                    $query->where('is_hidden', false)
                        ->with(['requestType', 'storageLocation', 'currentVersion'])
                        ->orderByRaw('COALESCE(approval_date, request_date) DESC');
                },
            ])
            ->orderBy('id')
            ->limit(15)
            ->get();
    }

    /**
     * Find a branch by ID.
     */
    public function findById(int $id): ?BranchModel
    {
        return BranchModel::with(['business', 'documents'])->find($id);
    }

    /**
     * Create a new branch.
     */
    public function create(CreateBranchData $data, ?User $user = null): BranchModel
    {
        /** @var BranchModel $branch */
        $branch = BranchModel::create([
            'business_id' => $data->businessId,
            'location' => $data->location,
        ]);

        Activity::create([
            'user_id' => $user?->id,
            'subject_type' => BranchModel::class,
            'subject_id' => $branch->id,
            'action' => 'branch.created',
            'details' => [
                'business_id' => $branch->business_id,
                'location' => $branch->location,
            ],
        ]);

        return $branch;
    }

    /**
     * Update an existing branch.
     */
    public function update(BranchModel $branch, UpdateBranchData $data, ?User $user = null): BranchModel
    {
        $oldLocation = $branch->location;

        $branch->update([
            'location' => $data->location,
        ]);

        Activity::create([
            'user_id' => $user?->id,
            'subject_type' => BranchModel::class,
            'subject_id' => $branch->id,
            'action' => 'branch.updated',
            'details' => [
                'old_location' => $oldLocation,
                'new_location' => $branch->location,
            ],
        ]);

        return $branch;
    }

    /**
     * Re-parent a branch to another business.
     */
    public function reparent(ReparentBranchData $data, ?User $user = null): BranchModel
    {
        /** @var BranchModel $branch */
        $branch = BranchModel::findOrFail($data->branchId);

        // Check if collision occurs under the new target business
        $existing = BranchModel::where('business_id', $data->newBusinessId)
            ->where('location', $branch->location)
            ->where('id', '!=', $branch->id)
            ->first();

        if ($existing) {
            // Merge source branch into existing branch on collision
            return $this->merge(new MergeBranchData(
                sourceBranchId: $branch->id,
                targetBranchId: $existing->id
            ), $user);
        }

        $oldBusinessId = $branch->business_id;

        $branch->update([
            'business_id' => $data->newBusinessId,
        ]);

        Activity::create([
            'user_id' => $user?->id,
            'subject_type' => BranchModel::class,
            'subject_id' => $branch->id,
            'action' => 'branch.reparented',
            'details' => [
                'branch_id' => $branch->id,
                'old_business_id' => $oldBusinessId,
                'new_business_id' => $data->newBusinessId,
            ],
        ]);

        return $branch;
    }

    /**
     * Merge source branch into target branch.
     */
    public function merge(MergeBranchData $data, ?User $user = null): BranchModel
    {
        /** @var BranchModel $source */
        $source = BranchModel::findOrFail($data->sourceBranchId);
        /** @var BranchModel $target */
        $target = BranchModel::findOrFail($data->targetBranchId);

        $sourceLocation = $source->location;

        // Re-point documents from source branch to target branch
        $source->documents()->update([
            'branch_id' => $target->id,
        ]);

        // Soft delete duplicate empty source branch
        $source->delete();

        Activity::create([
            'user_id' => $user?->id,
            'subject_type' => BranchModel::class,
            'subject_id' => $target->id,
            'action' => 'branch.merged',
            'details' => [
                'source_branch_id' => $data->sourceBranchId,
                'source_location' => $sourceLocation,
                'target_branch_id' => $target->id,
                'target_location' => $target->location,
            ],
        ]);

        return $target;
    }
}
