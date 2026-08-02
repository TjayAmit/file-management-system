<?php

namespace App\Http\Controllers;

use App\DTOs\CreateBranchData;
use App\DTOs\MergeBranchData;
use App\DTOs\ReparentBranchData;
use App\DTOs\UpdateBranchData;
use App\Models\Branch;
use App\Services\BranchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class BranchController extends Controller
{
    public function __construct(
        private readonly BranchService $branchService,
    ) {}

    /**
     * Display a listing of branches.
     */
    public function index(Request $request): InertiaResponse
    {
        $businessId = $request->query('business_id') !== null ? (int) $request->query('business_id') : null;
        $query = (string) $request->query('query', '');

        $branches = $this->branchService->searchBranches($businessId, $query);

        return Inertia::render('branches/index', [
            'branches' => $branches,
            'filters' => [
                'business_id' => $businessId,
                'query' => $query,
            ],
        ]);
    }

    /**
     * Store a newly created branch in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'business_id' => ['required', 'integer', 'exists:businesses,id'],
            'location' => ['required', 'string', 'max:255'],
        ]);

        $data = new CreateBranchData(
            businessId: (int) $validated['business_id'],
            location: (string) $validated['location'],
        );

        $this->branchService->createBranch($data, $request->user());

        return back()->with('status', 'Branch created successfully');
    }

    /**
     * Update the specified branch in storage.
     */
    public function update(Request $request, Branch $branch): RedirectResponse
    {
        $validated = $request->validate([
            'location' => ['required', 'string', 'max:255'],
        ]);

        $data = new UpdateBranchData(
            location: (string) $validated['location'],
        );

        $this->branchService->updateBranch($branch, $data, $request->user());

        return back()->with('status', 'Branch updated successfully');
    }

    /**
     * Re-parent a branch to a new business.
     */
    public function reparent(Request $request, Branch $branch): RedirectResponse
    {
        $validated = $request->validate([
            'new_business_id' => ['required', 'integer', 'exists:businesses,id'],
        ]);

        $data = new ReparentBranchData(
            branchId: $branch->id,
            newBusinessId: (int) $validated['new_business_id'],
        );

        $this->branchService->reparentBranch($data, $request->user());

        return back()->with('status', 'Branch re-parented successfully');
    }

    /**
     * Merge duplicate branches.
     */
    public function merge(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'source_branch_id' => ['required', 'integer', 'exists:branches,id'],
            'target_branch_id' => ['required', 'integer', 'exists:branches,id', 'different:source_branch_id'],
        ]);

        $data = new MergeBranchData(
            sourceBranchId: (int) $validated['source_branch_id'],
            targetBranchId: (int) $validated['target_branch_id'],
        );

        $this->branchService->mergeBranches($data, $request->user());

        return back()->with('status', 'Branches merged successfully');
    }
}
