<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateBusinessData;
use App\DTOs\MergeBusinessData;
use App\DTOs\UpdateBusinessData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Business\IndexBusinessRequest;
use App\Http\Requests\Business\MergeBusinessRequest;
use App\Http\Requests\Business\StoreBusinessRequest;
use App\Http\Requests\Business\UpdateBusinessRequest;
use App\Models\Business;
use App\Services\BusinessService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class BusinessController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly BusinessService $businessService,
    ) {}

    /**
     * Display a listing of businesses (with typeahead query support).
     */
    public function index(IndexBusinessRequest $request): JsonResponse
    {
        $businesses = $this->businessService->searchBusinesses($request->searchTerm());

        return $this->successResponse($businesses, 'Businesses retrieved successfully');
    }

    /**
     * Store a newly created business.
     */
    public function store(StoreBusinessRequest $request): JsonResponse
    {
        $data = new CreateBusinessData(
            name: (string) $request->validated('name'),
        );

        $business = $this->businessService->createBusiness($data, $request->user());

        return $this->successResponse($business, 'Business created successfully', 201);
    }

    /**
     * Update the specified business.
     */
    public function update(UpdateBusinessRequest $request, Business $business): JsonResponse
    {
        $data = new UpdateBusinessData(
            name: (string) $request->validated('name'),
        );

        $updatedBusiness = $this->businessService->updateBusiness($business, $data, $request->user());

        return $this->successResponse($updatedBusiness, 'Business updated successfully');
    }

    /**
     * Merge a duplicate business into a target business.
     */
    public function merge(MergeBusinessRequest $request): JsonResponse
    {
        $data = new MergeBusinessData(
            sourceId: (int) $request->validated('source_id'),
            targetId: (int) $request->validated('target_id'),
        );

        $targetBusiness = $this->businessService->mergeBusinesses($data, $request->user());

        return $this->successResponse($targetBusiness, 'Business merged successfully');
    }
}
