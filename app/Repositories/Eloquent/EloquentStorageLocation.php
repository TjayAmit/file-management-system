<?php

namespace App\Repositories\Eloquent;

use App\DTOs\CreateStorageLocationData;
use App\DTOs\UpdateStorageLocationData;
use App\Models\Activity;
use App\Models\StorageLocation as StorageLocationModel;
use App\Models\User;
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
    public function create(CreateStorageLocationData $data, ?User $user = null): StorageLocationModel
    {
        /** @var StorageLocationModel $location */
        $location = StorageLocationModel::create([
            'name' => $data->name,
        ]);

        Activity::create([
            'user_id' => $user?->id,
            'subject_type' => StorageLocationModel::class,
            'subject_id' => $location->id,
            'action' => 'storage_location.created',
            'details' => [
                'name' => $location->name,
            ],
        ]);

        return $location;
    }

    /**
     * Update an existing storage location.
     */
    public function update(StorageLocationModel $storageLocation, UpdateStorageLocationData $data, ?User $user = null): StorageLocationModel
    {
        $oldName = $storageLocation->name;

        $storageLocation->update([
            'name' => $data->name,
        ]);

        Activity::create([
            'user_id' => $user?->id,
            'subject_type' => StorageLocationModel::class,
            'subject_id' => $storageLocation->id,
            'action' => 'storage_location.updated',
            'details' => [
                'old_name' => $oldName,
                'new_name' => $storageLocation->name,
            ],
        ]);

        return $storageLocation;
    }
}
