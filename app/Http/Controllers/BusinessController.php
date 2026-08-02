<?php

namespace App\Http\Controllers;

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
     * Merge a duplicate business into a target business.
     */
    public function merge(Request $request): RedirectResponse
    {
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
