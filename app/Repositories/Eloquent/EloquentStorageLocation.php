<?php

namespace App\Repositories\Eloquent;

use App\DTOs\CreateStorageLocationData;
use App\DTOs\UpdateStorageLocationData;
use App\Models\StorageLocation as StorageLocationModel;
use App\Repositories\Interface\StorageLocation as StorageLocationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentStorageLocation implements StorageLocationRepositoryInterface
{
    /**
     * Get all storage locations.
     *
     * @return Collection<int, StorageLocationModel>
     */
    public function all(): Collection
    {
        return StorageLocationModel::all();
    }

    /**
     * Find storage location by ID.
     */
    public function findById(int $id): ?StorageLocationModel
    {
        return StorageLocationModel::find($id);
    }

    /**
     * Create a new storage location.
     */
    public function create(CreateStorageLocationData $data): StorageLocationModel
    {
        /** @var StorageLocationModel $location */
        $location = StorageLocationModel::create([
            'name' => $data->name,
        ]);

        return $location;
    }

    /**
     * Update an existing storage location.
     */
    public function update(StorageLocationModel $storageLocation, UpdateStorageLocationData $data): StorageLocationModel
    {
        $storageLocation->update([
            'name' => $data->name,
        ]);

        return $storageLocation;
    }
}
