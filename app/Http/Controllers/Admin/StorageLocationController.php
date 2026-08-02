<?php

namespace App\Http\Controllers\Admin;

use App\DTOs\CreateStorageLocationData;
use App\DTOs\UpdateStorageLocationData;
use App\Http\Controllers\Controller;
use App\Models\StorageLocation;
use App\Services\StorageLocationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StorageLocationController extends Controller
{
    public function __construct(
        private readonly StorageLocationService $storageLocationService,
    ) {}

    /**
     * Store a newly created storage location.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', StorageLocation::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new CreateStorageLocationData(
            name: (string) $validated['name'],
        );

        $this->storageLocationService->createStorageLocation($data, $request->user());

        return back()->with('status', 'Storage location created successfully');
    }

    /**
     * Update the specified storage location.
     */
    public function update(Request $request, StorageLocation $storageLocation): RedirectResponse
    {
        $this->authorize('update', $storageLocation);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new UpdateStorageLocationData(
            name: (string) $validated['name'],
        );

        $this->storageLocationService->updateStorageLocation($storageLocation, $data, $request->user());

        return back()->with('status', 'Storage location updated successfully');
    }
}
