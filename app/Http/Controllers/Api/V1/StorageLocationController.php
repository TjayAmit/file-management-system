<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
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
     * Display a listing of storage locations.
     */
    public function index(): JsonResponse
    {
        $locations = $this->storageLocationService->getAllStorageLocations();

        return $this->successResponse($locations, 'Storage locations retrieved successfully');
    }
}
