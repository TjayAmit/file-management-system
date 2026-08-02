<?php

namespace App\Http\Controllers;

use App\DTOs\SearchDocumentsData;
use App\Services\SearchService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SearchController extends Controller
{
    public function __construct(
        private readonly SearchService $searchService,
    ) {}

    /**
     * Search documents, narrowing business → branch → request type → date.
     */
    public function index(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'business' => ['nullable', 'string', 'max:255'],
            'business_id' => ['nullable', 'integer', 'exists:businesses,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'request_type_id' => ['nullable', 'integer', 'exists:request_types,id'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $businessQuery = (string) ($validated['business'] ?? '');
        $businessId = isset($validated['business_id']) ? (int) $validated['business_id'] : null;
        $branchId = isset($validated['branch_id']) ? (int) $validated['branch_id'] : null;
        $requestTypeId = isset($validated['request_type_id']) ? (int) $validated['request_type_id'] : null;
        $location = trim((string) ($validated['location'] ?? ''));

        $result = null;

        if ($businessQuery !== '' || $businessId !== null) {
            $data = new SearchDocumentsData(
                businessQuery: $businessQuery,
                businessId: $businessId,
                branchId: $branchId,
                requestTypeId: $requestTypeId,
            );

            $result = $this->searchService->search($data);
        }

        $locationResults = $location !== '' ? $this->searchService->searchByLocation($location) : null;

        return Inertia::render('search/index', [
            'result' => $result,
            'locationResults' => $locationResults,
            'filters' => [
                'business' => $businessQuery,
                'business_id' => $businessId,
                'branch_id' => $branchId,
                'request_type_id' => $requestTypeId,
                'location' => $location,
            ],
        ]);
    }
}
