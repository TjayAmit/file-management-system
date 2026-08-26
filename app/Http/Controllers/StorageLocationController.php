<?php

namespace App\Http\Controllers;

use App\Models\StorageLocation;
use App\Services\StorageLocationService;
use Illuminate\Http\Request;
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
    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', StorageLocation::class);

        return Inertia::render('storage-locations/index', [
            'storageLocations' => $this->storageLocationService->getAllStorageLocations(),
            'can' => [
                'manage' => $request->user()?->can('create', StorageLocation::class) ?? false,
            ],
        ]);
    }
}
