<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\DTOs\CreateStorageLocationData;
use App\DTOs\UpdateStorageLocationData;
use App\Http\Controllers\Controller;
use App\Models\StorageLocation;
use App\Services\StorageLocationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StorageLocationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly StorageLocationService $storageLocationService,
    ) {}

    /**
     * Store a newly created storage location.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', StorageLocation::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new CreateStorageLocationData(
            name: (string) $validated['name'],
        );

        $location = $this->storageLocationService->createStorageLocation($data);

        return $this->successResponse($location, 'Storage location created successfully', 201);
    }

    /**
     * Update the specified storage location.
     */
    public function update(Request $request, StorageLocation $storageLocation): JsonResponse
    {
        $this->authorize('update', $storageLocation);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new UpdateStorageLocationData(
            name: (string) $validated['name'],
        );

        $updatedLocation = $this->storageLocationService->updateStorageLocation($storageLocation, $data);

        return $this->successResponse($updatedLocation, 'Storage location updated successfully');
    }
}
