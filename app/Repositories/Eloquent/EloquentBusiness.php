<?php

namespace App\Repositories\Eloquent;

use App\DTOs\BulkSeedBusinessesData;
use App\DTOs\CreateBusinessData;
use App\DTOs\MergeBusinessData;
use App\DTOs\UpdateBusinessData;
use App\Models\Activity;
use App\Models\Branch as BranchModel;
use App\Models\Business as BusinessModel;
use App\Models\User;
use App\Repositories\Interface\Business as BusinessRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class EloquentBusiness implements BusinessRepositoryInterface
{
    /**
     * Get all businesses.
     *
     * @return Collection<int, BusinessModel>
     */
    public function all(): Collection
    {
        return BusinessModel::with('branches')->get();
    }

    /**
     * Search businesses by name for typeahead suggestions.
     *
     * @return Collection<int, BusinessModel>
     */
    public function search(string $query): Collection
    {
        if (trim($query) === '') {
            return $this->all();
        }

        return BusinessModel::where('name', 'like', '%'.$query.'%')
            ->with('branches')
            ->limit(15)
            ->get();
    }

    /**
     * Find a business by ID.
     */
    public function findById(int $id): ?BusinessModel
    {
        return BusinessModel::with('branches')->find($id);
    }

    /**
     * Find a business by its exact, controlled-vocabulary name.
     */
    public function findByExactName(string $name): ?BusinessModel
    {
        return BusinessModel::where('name', $name)->with('branches')->first();
    }

    /**
     * Create a new business.
     */
    public function create(CreateBusinessData $data, ?User $user = null): BusinessModel
    {
        /** @var BusinessModel $business */
        $business = BusinessModel::create([
            'name' => $data->name,
        ]);

        Activity::create([
            'user_id' => $user?->id,
            'subject_type' => BusinessModel::class,
            'subject_id' => $business->id,
            'action' => 'business.created',
            'details' => [
                'name' => $business->name,
            ],
        ]);

        return $business;
    }

    /**
     * Update an existing business.
     */
    public function update(BusinessModel $business, UpdateBusinessData $data, ?User $user = null): BusinessModel
    {
        $oldName = $business->name;

        $business->update([
            'name' => $data->name,
        ]);

        Activity::create([
            'user_id' => $user?->id,
            'subject_type' => BusinessModel::class,
            'subject_id' => $business->id,
            'action' => 'business.updated',
            'details' => [
                'old_name' => $oldName,
                'new_name' => $business->name,
            ],
        ]);

        return $business;
    }

    /**
     * Merge source business into target business.
     */
    public function merge(MergeBusinessData $data, ?User $user = null): BusinessModel
    {
        /** @var BusinessModel $source */
        $source = BusinessModel::findOrFail($data->sourceId);
        /** @var BusinessModel $target */
        $target = BusinessModel::findOrFail($data->targetId);

        $sourceName = $source->name;

        // Re-point branches
        $source->branches()->update([
            'business_id' => $target->id,
        ]);

        // Soft delete duplicate
        $source->delete();

        // Log in activities
        Activity::create([
            'user_id' => $user?->id,
            'subject_type' => BusinessModel::class,
            'subject_id' => $target->id,
            'action' => 'business.merged',
            'details' => [
                'source_id' => $data->sourceId,
                'source_name' => $sourceName,
                'target_id' => $target->id,
                'target_name' => $target->name,
            ],
        ]);

        return $target;
    }

    /**
     * Bulk seed businesses (and optionally their branches). Each row is
     * matched by its exact name/location before creating, so re-running the
     * same list is safe.
     */
    public function bulkSeed(BulkSeedBusinessesData $data, ?User $user = null): array
    {
        return DB::transaction(function () use ($data, $user) {
            $summary = [
                'businesses_created' => 0,
                'businesses_existing' => 0,
                'branches_created' => 0,
                'branches_existing' => 0,
            ];

            foreach ($data->rows as $row) {
                $name = trim($row['name']);

                if ($name === '') {
                    continue;
                }

                $business = BusinessModel::where('name', $name)->first();

                if ($business === null) {
                    $business = BusinessModel::create(['name' => $name]);

                    Activity::create([
                        'user_id' => $user?->id,
                        'subject_type' => BusinessModel::class,
                        'subject_id' => $business->id,
                        'action' => 'business.seeded',
                        'details' => ['name' => $business->name],
                    ]);

                    $summary['businesses_created']++;
                } else {
                    $summary['businesses_existing']++;
                }

                $location = isset($row['branch']) ? trim((string) $row['branch']) : '';

                if ($location === '') {
                    continue;
                }

                $branch = BranchModel::where('business_id', $business->id)
                    ->where('location', $location)
                    ->first();

                if ($branch === null) {
                    $branch = BranchModel::create([
                        'business_id' => $business->id,
                        'location' => $location,
                    ]);

                    Activity::create([
                        'user_id' => $user?->id,
                        'subject_type' => BranchModel::class,
                        'subject_id' => $branch->id,
                        'action' => 'branch.seeded',
                        'details' => [
                            'business_id' => $business->id,
                            'location' => $branch->location,
                        ],
                    ]);

                    $summary['branches_created']++;
                } else {
                    $summary['branches_existing']++;
                }
            }

            return $summary;
        });
    }
}
