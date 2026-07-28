<?php

namespace App\Repositories\Interface;

use App\DTOs\CreateStorageLocationData;
use App\DTOs\UpdateStorageLocationData;
use App\Models\StorageLocation as StorageLocationModel;
use Illuminate\Database\Eloquent\Collection;

interface StorageLocation
{
    /**
     * Get all storage locations.
     *
     * @return Collection<int, StorageLocationModel>
     */
    public function all(): Collection;

    /**
     * Find storage location by ID.
     */
    public function findById(int $id): ?StorageLocationModel;

    /**
     * Create a new storage location.
     */
    public function create(CreateStorageLocationData $data): StorageLocationModel;

    /**
     * Update an existing storage location.
     */
    public function update(StorageLocationModel $storageLocation, UpdateStorageLocationData $data): StorageLocationModel;
}
