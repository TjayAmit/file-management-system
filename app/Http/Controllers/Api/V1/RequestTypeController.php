<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateRequestTypeData;
use App\DTOs\MergeRequestTypeData;
use App\DTOs\UpdateRequestTypeData;
use App\Http\Controllers\Controller;
use App\Http\Requests\RequestType\IndexRequestTypeRequest;
use App\Http\Requests\RequestType\MergeRequestTypeRequest;
use App\Http\Requests\RequestType\StoreRequestTypeRequest;
use App\Http\Requests\RequestType\UpdateRequestTypeRequest;
use App\Models\RequestType;
use App\Services\RequestTypeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class RequestTypeController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly RequestTypeService $requestTypeService,
    ) {}

    /**
     * Display a listing of request types (with typeahead query support).
     */
    public function index(IndexRequestTypeRequest $request): JsonResponse
    {
        $requestTypes = $this->requestTypeService->searchRequestTypes($request->searchTerm());

        return $this->successResponse($requestTypes, 'Request types retrieved successfully');
    }

    /**
     * Store a newly created request type.
     */
    public function store(StoreRequestTypeRequest $request): JsonResponse
    {
        $data = new CreateRequestTypeData(
            name: (string) $request->validated('name'),
        );

        $requestType = $this->requestTypeService->createRequestType($data, $request->user());

        return $this->successResponse($requestType, 'Request type created successfully', 201);
    }

    /**
     * Update the specified request type.
     */
    public function update(UpdateRequestTypeRequest $request, RequestType $requestType): JsonResponse
    {
        $data = new UpdateRequestTypeData(
            name: (string) $request->validated('name'),
        );

        $updatedRequestType = $this->requestTypeService->updateRequestType($requestType, $data, $request->user());

        return $this->successResponse($updatedRequestType, 'Request type updated successfully');
    }

    /**
     * Merge duplicate request types.
     */
    public function merge(MergeRequestTypeRequest $request): JsonResponse
    {
        $data = new MergeRequestTypeData(
            sourceRequestTypeId: (int) $request->validated('source_request_type_id'),
            targetRequestTypeId: (int) $request->validated('target_request_type_id'),
        );

        $targetRequestType = $this->requestTypeService->mergeRequestTypes($data, $request->user());

        return $this->successResponse($targetRequestType, 'Request types merged successfully');
    }
}
