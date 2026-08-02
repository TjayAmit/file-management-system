<?php

namespace App\Http\Controllers;

use App\Models\StorageLocation;
use App\Services\StorageLocationService;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class StorageLocationController extends Controller
{
    public function __construct(
        private readonly StorageLocationService $storageLocationService,
    ) {}

    /**
     * Display a listing of storage locations.
     */
    public function index(): InertiaResponse
    {
        $this->authorize('viewAny', StorageLocation::class);

        $locations = $this->storageLocationService->getAllStorageLocations();

        return Inertia::render('storage-locations/index', [
            'storageLocations' => $locations,
        ]);
    }
}
