<?php

namespace App\Http\Controllers;

use App\DTOs\BulkSeedBusinessesData;
use App\DTOs\CreateBusinessData;
use App\DTOs\MergeBusinessData;
use App\DTOs\UpdateBusinessData;
use App\Models\Business;
use App\Services\BusinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', Business::class);

        $query = (string) $request->query('query', '');
        $businesses = $this->businessService->searchBusinesses($query);

        return Inertia::render('businesses/index', [
            'businesses' => $businesses,
            'filters' => [
                'query' => $query,
            ],
        ]);
    }

    /**
     * Store a newly created business in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Business::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new CreateBusinessData(
            name: (string) $validated['name'],
        );

        $this->businessService->createBusiness($data, $request->user());

        return back()->with('status', 'Business created successfully');
    }

    /**
     * Update the specified business in storage.
     */
    public function update(Request $request, Business $business): RedirectResponse
    {
        $this->authorize('update', $business);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $data = new UpdateBusinessData(
            name: (string) $validated['name'],
        );

        $this->businessService->updateBusiness($business, $data, $request->user());

        return back()->with('status', 'Business updated successfully');
    }

    /**
     * Bulk seed businesses (and optionally their branches) from a pre-launch
     * or pilot-encoding list (PLAN.md §4.3, §6.2).
     */
    public function bulkSeed(Request $request): RedirectResponse
    {
        $this->authorize('create', Business::class);

        $validated = $request->validate([
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.name' => ['required', 'string', 'max:255'],
            'rows.*.branch' => ['nullable', 'string', 'max:255'],
        ]);

        $data = new BulkSeedBusinessesData(
            rows: array_map(
                fn (array $row): array => [
                    'name' => (string) $row['name'],
                    'branch' => isset($row['branch']) ? (string) $row['branch'] : null,
                ],
                $validated['rows'],
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
    public function merge(Request $request): RedirectResponse
    {
        $this->authorize('merge', Business::class);

        $validated = $request->validate([
            'source_id' => ['required', 'integer', 'exists:businesses,id'],
            'target_id' => ['required', 'integer', 'exists:businesses,id', 'different:source_id'],
        ]);

        $data = new MergeBusinessData(
            sourceId: (int) $validated['source_id'],
            targetId: (int) $validated['target_id'],
        );

        $this->businessService->mergeBusinesses($data, $request->user());

        return back()->with('status', 'Business merged successfully');
    }
}
