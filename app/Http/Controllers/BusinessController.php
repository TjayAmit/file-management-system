<?php

namespace App\Http\Controllers;

use App\DTOs\BulkSeedBusinessesData;
use App\DTOs\CreateBusinessData;
use App\DTOs\MergeBusinessData;
use App\DTOs\UpdateBusinessData;
use App\Http\Requests\Business\BulkSeedBusinessesRequest;
use App\Http\Requests\Business\IndexBusinessRequest;
use App\Http\Requests\Business\MergeBusinessRequest;
use App\Http\Requests\Business\StoreBusinessRequest;
use App\Http\Requests\Business\UpdateBusinessRequest;
use App\Models\Business;
use App\Services\BusinessService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class BusinessController extends Controller
{
    public function __construct(
        private readonly BusinessService $businessService,
    ) {}

    /**
     * Display a listing of businesses.
     */
    public function index(IndexBusinessRequest $request): InertiaResponse
    {
        $query = $request->searchTerm();

        return Inertia::render('businesses/index', [
            'businesses' => $this->businessService->searchBusinesses($query),
            'filters' => [
                'query' => $query,
            ],
            'can' => [
                'manage' => $request->user()?->can('create', Business::class) ?? false,
                'merge' => $request->user()?->can('merge', Business::class) ?? false,
            ],
        ]);
    }

    /**
     * Store a newly created business in storage.
     */
    public function store(StoreBusinessRequest $request): RedirectResponse
    {
        $data = new CreateBusinessData(
            name: (string) $request->validated('name'),
        );

        $this->businessService->createBusiness($data, $request->user());

        return back()->with('status', 'Business created successfully');
    }

    /**
     * Update the specified business in storage.
     */
    public function update(UpdateBusinessRequest $request, Business $business): RedirectResponse
    {
        $data = new UpdateBusinessData(
            name: (string) $request->validated('name'),
        );

        $this->businessService->updateBusiness($business, $data, $request->user());

        return back()->with('status', 'Business updated successfully');
    }

    /**
     * Bulk seed businesses (and optionally their branches) from a pre-launch
     * or pilot-encoding list (PLAN.md 4.3, 6.2).
     */
    public function bulkSeed(BulkSeedBusinessesRequest $request): RedirectResponse
    {
        /** @var array<int, array{name: string, branch?: string|null}> $rows */
        $rows = $request->validated('rows');

        $data = new BulkSeedBusinessesData(
            rows: array_map(
                fn (array $row): array => [
                    'name' => (string) $row['name'],
                    'branch' => isset($row['branch']) ? (string) $row['branch'] : null,
                ],
                $rows,
            ),
        );

        $summary = $this->businessService->bulkSeed($data, $request->user());

        return back()->with(
            'status',
            "Seeded {$summary['businesses_created']} new business(es) and {$summary['branches_created']} new branch(es)."
        );
    }

    /**
     * Merge a duplicate business into a target business.
     */
    public function merge(MergeBusinessRequest $request): RedirectResponse
    {
        $data = new MergeBusinessData(
            sourceId: (int) $request->validated('source_id'),
            targetId: (int) $request->validated('target_id'),
        );

        $this->businessService->mergeBusinesses($data, $request->user());

        return back()->with('status', 'Business merged successfully');
    }
}
