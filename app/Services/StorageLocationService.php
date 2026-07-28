<?php

namespace App\Services;

use App\DTOs\CreateStorageLocationData;
use App\DTOs\UpdateStorageLocationData;
use App\Models\StorageLocation as StorageLocationModel;
use App\Repositories\Interface\StorageLocation as StorageLocationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class StorageLocationService
{
    public function __construct(
        private readonly StorageLocationRepositoryInterface $storageLocationRepository,
    ) {}

    /**
     * Get all storage locations.
     *
     * @return Collection<int, StorageLocationModel>
     */
    public function getAllStorageLocations(): Collection
    {
        return $this->storageLocationRepository->all();
    }

    /**
     * Find storage location by ID.
     */
    public function getStorageLocationById(int $id): ?StorageLocationModel
    {
        return $this->storageLocationRepository->findById($id);
    }

    /**
     * Create a new storage location.
     */
    public function createStorageLocation(CreateStorageLocationData $data): StorageLocationModel
    {
        return $this->storageLocationRepository->create($data);
    }

    /**
     * Update an existing storage location.
     */
    public function updateStorageLocation(StorageLocationModel $storageLocation, UpdateStorageLocationData $data): StorageLocationModel
    {
        return $this->storageLocationRepository->update($storageLocation, $data);
    }
}
