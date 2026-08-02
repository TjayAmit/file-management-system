<?php

namespace App\Services;

use App\DTOs\BulkSeedBusinessesData;
use App\DTOs\CreateBusinessData;
use App\DTOs\MergeBusinessData;
use App\DTOs\UpdateBusinessData;
use App\Models\Business as BusinessModel;
use App\Models\User;
use App\Repositories\Interface\Business as BusinessRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class BusinessService
{
    public function __construct(
        private readonly BusinessRepositoryInterface $businessRepository,
    ) {}

    /**
     * Get all businesses.
     *
     * @return Collection<int, BusinessModel>
     */
    public function getAllBusinesses(): Collection
    {
        return $this->businessRepository->all();
    }

    /**
     * Search businesses for typeahead.
     *
     * @return Collection<int, BusinessModel>
     */
    public function searchBusinesses(string $query): Collection
    {
        return $this->businessRepository->search($query);
    }

    /**
     * Find business by ID.
     */
    public function getBusinessById(int $id): ?BusinessModel
    {
        return $this->businessRepository->findById($id);
    }

    /**
     * Create a new business.
     */
    public function createBusiness(CreateBusinessData $data, ?User $user = null): BusinessModel
    {
        return $this->businessRepository->create($data, $user);
    }

    /**
     * Update a business.
     */
    public function updateBusiness(BusinessModel $business, UpdateBusinessData $data, ?User $user = null): BusinessModel
    {
        return $this->businessRepository->update($business, $data, $user);
    }

    /**
     * Merge source business into target business.
     */
    public function mergeBusinesses(MergeBusinessData $data, ?User $user = null): BusinessModel
    {
        return $this->businessRepository->merge($data, $user);
    }

    /**
     * Bulk seed businesses (and optionally their branches) from a pre-launch
     * or pilot-encoding list (PLAN.md §4.3, §6.2).
     *
     * @return array{businesses_created: int, businesses_existing: int, branches_created: int, branches_existing: int}
     */
    public function bulkSeed(BulkSeedBusinessesData $data, ?User $user = null): array
    {
        return $this->businessRepository->bulkSeed($data, $user);
    }
}
