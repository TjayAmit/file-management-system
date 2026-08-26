<?php

namespace App\Http\Controllers;

use App\DTOs\CreateRequestTypeData;
use App\DTOs\MergeRequestTypeData;
use App\DTOs\UpdateRequestTypeData;
use App\Http\Requests\RequestType\IndexRequestTypeRequest;
use App\Http\Requests\RequestType\MergeRequestTypeRequest;
use App\Http\Requests\RequestType\StoreRequestTypeRequest;
use App\Http\Requests\RequestType\UpdateRequestTypeRequest;
use App\Models\RequestType;
use App\Services\RequestTypeService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class RequestTypeController extends Controller
{
    public function __construct(
        private readonly RequestTypeService $requestTypeService,
    ) {}

    /**
     * Display a listing of request types.
     */
    public function index(IndexRequestTypeRequest $request): InertiaResponse
    {
        $query = $request->searchTerm();

        return Inertia::render('request-types/index', [
            'requestTypes' => $this->requestTypeService->searchRequestTypes($query),
            'filters' => [
                'query' => $query,
            ],
            'can' => [
                'manage' => $request->user()?->can('create', RequestType::class) ?? false,
                'merge' => $request->user()?->can('merge', RequestType::class) ?? false,
            ],
        ]);
    }

    /**
     * Store a newly created request type in storage.
     */
    public function store(StoreRequestTypeRequest $request): RedirectResponse
    {
        $data = new CreateRequestTypeData(
            name: (string) $request->validated('name'),
        );

        $this->requestTypeService->createRequestType($data, $request->user());

        return back()->with('status', 'Request type created successfully');
    }

    /**
     * Update the specified request type in storage.
     */
    public function update(UpdateRequestTypeRequest $request, RequestType $requestType): RedirectResponse
    {
        $data = new UpdateRequestTypeData(
            name: (string) $request->validated('name'),
        );

        $this->requestTypeService->updateRequestType($requestType, $data, $request->user());

        return back()->with('status', 'Request type updated successfully');
    }

    /**
     * Merge duplicate request types.
     */
    public function merge(MergeRequestTypeRequest $request): RedirectResponse
    {
        $data = new MergeRequestTypeData(
            sourceRequestTypeId: (int) $request->validated('source_request_type_id'),
            targetRequestTypeId: (int) $request->validated('target_request_type_id'),
        );

        $this->requestTypeService->mergeRequestTypes($data, $request->user());

        return back()->with('status', 'Request types merged successfully');
    }
}
