<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateRequestTypeData;
use App\DTOs\MergeRequestTypeData;
use App\DTOs\UpdateRequestTypeData;
use App\Http\Controllers\Controller;
use App\Models\RequestType;
use App\Services\RequestTypeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestTypeController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly RequestTypeService $requestTypeService,
    ) {}

    /**
     * Display a listing of request types (supports typeahead query).
     */
    public function index(Request $request): JsonResponse
    {
        $query = (string) $request->query('query', '');
        $requestTypes = $this->requestTypeService->searchRequestTypes($query);

        return $this->successResponse($requestTypes, 'Request types retrieved successfully');
    }

    /**
     * Store a newly created request type.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', RequestType::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new CreateRequestTypeData(
            name: (string) $validated['name'],
        );

        $requestType = $this->requestTypeService->createRequestType($data);

        return $this->successResponse($requestType, 'Request type created successfully', 201);
    }

    /**
     * Update the specified request type.
     */
    public function update(Request $request, RequestType $requestType): JsonResponse
    {
        $this->authorize('update', $requestType);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new UpdateRequestTypeData(
            name: (string) $validated['name'],
        );

        $updatedRequestType = $this->requestTypeService->updateRequestType($requestType, $data);

        return $this->successResponse($updatedRequestType, 'Request type updated successfully');
    }

    /**
     * Merge duplicate request types.
     */
    public function merge(Request $request): JsonResponse
    {
        $this->authorize('merge', RequestType::class);

        $validated = $request->validate([
            'source_request_type_id' => ['required', 'integer', 'exists:request_types,id'],
            'target_request_type_id' => ['required', 'integer', 'exists:request_types,id', 'different:source_request_type_id'],
        ]);

        $data = new MergeRequestTypeData(
            sourceRequestTypeId: (int) $validated['source_request_type_id'],
            targetRequestTypeId: (int) $validated['target_request_type_id'],
        );

        $targetRequestType = $this->requestTypeService->mergeRequestTypes($data, $request->user());

        return $this->successResponse($targetRequestType, 'Request types merged successfully');
    }
}
