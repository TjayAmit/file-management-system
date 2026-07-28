<?php

namespace App\Services;

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
    public function createBusiness(CreateBusinessData $data): BusinessModel
    {
        return $this->businessRepository->create($data);
    }

    /**
     * Update a business.
     */
    public function updateBusiness(BusinessModel $business, UpdateBusinessData $data): BusinessModel
    {
        return $this->businessRepository->update($business, $data);
    }

    /**
     * Merge source business into target business.
     */
    public function mergeBusinesses(MergeBusinessData $data, ?User $user = null): BusinessModel
    {
        return $this->businessRepository->merge($data, $user);
    }
}
