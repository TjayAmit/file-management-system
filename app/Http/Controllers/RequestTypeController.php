<?php

namespace App\Http\Controllers;

use App\DTOs\CreateRequestTypeData;
use App\DTOs\MergeRequestTypeData;
use App\DTOs\UpdateRequestTypeData;
use App\Models\RequestType;
use App\Services\RequestTypeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
    public function index(Request $request): InertiaResponse
    {
        $query = (string) $request->query('query', '');
        $requestTypes = $this->requestTypeService->searchRequestTypes($query);

        return Inertia::render('request-types/index', [
            'requestTypes' => $requestTypes,
            'filters' => [
                'query' => $query,
            ],
        ]);
    }

    /**
     * Store a newly created request type in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new CreateRequestTypeData(
            name: (string) $validated['name'],
        );

        $this->requestTypeService->createRequestType($data);

        return back()->with('status', 'Request type created successfully');
    }

    /**
     * Update the specified request type in storage.
     */
    public function update(Request $request, RequestType $requestType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new UpdateRequestTypeData(
            name: (string) $validated['name'],
        );

        $this->requestTypeService->updateRequestType($requestType, $data);

        return back()->with('status', 'Request type updated successfully');
    }

    /**
     * Merge duplicate request types.
     */
    public function merge(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'source_request_type_id' => ['required', 'integer', 'exists:request_types,id'],
            'target_request_type_id' => ['required', 'integer', 'exists:request_types,id', 'different:source_request_type_id'],
        ]);

        $data = new MergeRequestTypeData(
            sourceRequestTypeId: (int) $validated['source_request_type_id'],
            targetRequestTypeId: (int) $validated['target_request_type_id'],
        );

        $this->requestTypeService->mergeRequestTypes($data, $request->user());

        return back()->with('status', 'Request types merged successfully');
    }
}
