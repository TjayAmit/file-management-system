<?php

namespace App\Http\Controllers;

use App\DTOs\SearchDocumentsData;
use App\Http\Requests\Search\SearchDocumentsRequest;
use App\Services\BranchService;
use App\Services\BusinessService;
use App\Services\RequestTypeService;
use App\Services\SearchService;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SearchController extends Controller
{
    public function __construct(
        private readonly SearchService $searchService,
        private readonly BusinessService $businessService,
        private readonly BranchService $branchService,
        private readonly RequestTypeService $requestTypeService,
    ) {}

    /**
     * Search documents, narrowing business -> branch -> request type -> date.
     */
    public function index(SearchDocumentsRequest $request): InertiaResponse
    {
        $businessQuery = $request->businessQuery();
        $businessId = $request->filterId('business_id');
        $branchId = $request->filterId('branch_id');
        $requestTypeId = $request->filterId('request_type_id');
        $location = $request->locationQuery();

        $result = null;

        if ($businessQuery !== '' || $businessId !== null) {
            $data = new SearchDocumentsData(
                businessQuery: $businessQuery,
                businessId: $businessId,
                branchId: $branchId,
                requestTypeId: $requestTypeId,
            );

            $result = $this->searchService->search($data, $request->user());
        }

        $locationSearch = $location !== '' ? $this->searchService->searchByLocation($location, $request->user()) : null;

        return Inertia::render('search/index', [
            'result' => $result,
            'locationResults' => $locationSearch['branches'] ?? null,
            'locationSearchLogId' => $locationSearch['searchLogId'] ?? null,
            'businesses' => $this->businessService->getAllBusinesses(),
            'branches' => $businessId !== null ? $this->branchService->searchBranches($businessId, '') : [],
            'requestTypes' => $this->requestTypeService->getAllRequestTypes(),
            'filters' => [
                'business' => $businessQuery,
                'business_id' => $businessId,
                'branch_id' => $branchId,
                'request_type_id' => $requestTypeId,
                'location' => $location,
            ],
        ]);
    }

    /**
     * Simple hit-rate report for the office head (PLAN.md 5.3): progress
     * toward the 60% target.
     */
    public function report(): InertiaResponse
    {
        Gate::authorize('view-search-report');

        return Inertia::render('search/report', [
            'report' => $this->searchService->hitRateReport(),
        ]);
    }
}
