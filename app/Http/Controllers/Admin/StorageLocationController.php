<?php

namespace App\Http\Controllers\Admin;

use App\DTOs\CreateStorageLocationData;
use App\DTOs\UpdateStorageLocationData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorageLocation\StoreStorageLocationRequest;
use App\Http\Requests\StorageLocation\UpdateStorageLocationRequest;
use App\Models\StorageLocation;
use App\Services\StorageLocationService;
use Illuminate\Http\RedirectResponse;

class StorageLocationController extends Controller
{
    public function __construct(
        private readonly StorageLocationService $storageLocationService,
    ) {}

    /**
     * Store a newly created storage location.
     */
    public function store(StoreStorageLocationRequest $request): RedirectResponse
    {
        $data = new CreateStorageLocationData(
            name: (string) $request->validated('name'),
        );

        $this->storageLocationService->createStorageLocation($data, $request->user());

        return back()->with('status', 'Storage location created successfully');
    }

    /**
     * Update the specified storage location.
     */
    public function update(UpdateStorageLocationRequest $request, StorageLocation $storageLocation): RedirectResponse
    {
        $data = new UpdateStorageLocationData(
            name: (string) $request->validated('name'),
        );

        $this->storageLocationService->updateStorageLocation($storageLocation, $data, $request->user());

        return back()->with('status', 'Storage location updated successfully');
    }
}
