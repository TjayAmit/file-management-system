<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateBusinessData;
use App\DTOs\MergeBusinessData;
use App\DTOs\UpdateBusinessData;
use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\BusinessService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly BusinessService $businessService,
    ) {}

    /**
     * Display a listing of businesses (with typeahead query support).
     */
    public function index(Request $request): JsonResponse
    {
        $query = (string) $request->query('query', '');
        $businesses = $this->businessService->searchBusinesses($query);

        return $this->successResponse($businesses, 'Businesses retrieved successfully');
    }

    /**
     * Store a newly created business.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new CreateBusinessData(
            name: (string) $validated['name'],
        );

        $business = $this->businessService->createBusiness($data);

        return $this->successResponse($business, 'Business created successfully', 201);
    }

    /**
     * Update the specified business.
     */
    public function update(Request $request, Business $business): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new UpdateBusinessData(
            name: (string) $validated['name'],
        );

        $updatedBusiness = $this->businessService->updateBusiness($business, $data);

        return $this->successResponse($updatedBusiness, 'Business updated successfully');
    }

    /**
     * Merge a duplicate business into a target business.
     */
    public function merge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source_id' => ['required', 'integer', 'exists:businesses,id'],
            'target_id' => ['required', 'integer', 'exists:businesses,id', 'different:source_id'],
        ]);

        $data = new MergeBusinessData(
            sourceId: (int) $validated['source_id'],
            targetId: (int) $validated['target_id'],
        );

        $targetBusiness = $this->businessService->mergeBusinesses($data, $request->user());

        return $this->successResponse($targetBusiness, 'Business merged successfully');
    }
}
