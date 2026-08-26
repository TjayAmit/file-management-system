<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\DTOs\CreateStorageLocationData;
use App\DTOs\UpdateStorageLocationData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorageLocation\StoreStorageLocationRequest;
use App\Http\Requests\StorageLocation\UpdateStorageLocationRequest;
use App\Models\StorageLocation;
use App\Services\StorageLocationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class StorageLocationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly StorageLocationService $storageLocationService,
    ) {}

    /**
     * Store a newly created storage location.
     */
    public function store(StoreStorageLocationRequest $request): JsonResponse
    {
        $data = new CreateStorageLocationData(
            name: (string) $request->validated('name'),
        );

        $storageLocation = $this->storageLocationService->createStorageLocation($data, $request->user());

        return $this->successResponse($storageLocation, 'Storage location created successfully', 201);
    }

    /**
     * Update the specified storage location.
     */
    public function update(UpdateStorageLocationRequest $request, StorageLocation $storageLocation): JsonResponse
    {
        $data = new UpdateStorageLocationData(
            name: (string) $request->validated('name'),
        );

        $updated = $this->storageLocationService->updateStorageLocation($storageLocation, $data, $request->user());

        return $this->successResponse($updated, 'Storage location updated successfully');
    }
}
