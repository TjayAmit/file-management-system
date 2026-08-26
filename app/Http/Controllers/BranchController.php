<?php

namespace App\Http\Controllers;

use App\DTOs\CreateBranchData;
use App\DTOs\MergeBranchData;
use App\DTOs\ReparentBranchData;
use App\DTOs\UpdateBranchData;
use App\Http\Requests\Branch\IndexBranchRequest;
use App\Http\Requests\Branch\MergeBranchRequest;
use App\Http\Requests\Branch\ReparentBranchRequest;
use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Models\Branch;
use App\Services\BranchService;
use App\Services\BusinessService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class BranchController extends Controller
{
    public function __construct(
        private readonly BranchService $branchService,
        private readonly BusinessService $businessService,
    ) {}

    /**
     * Display a listing of branches.
     */
    public function index(IndexBranchRequest $request): InertiaResponse
    {
        $businessId = $request->businessId();
        $query = $request->searchTerm();

        return Inertia::render('branches/index', [
            'branches' => $this->branchService->searchBranches($businessId, $query),
            'businesses' => $this->businessService->getAllBusinesses(),
            'filters' => [
                'business_id' => $businessId,
                'query' => $query,
            ],
            'can' => [
                'manage' => $request->user()?->can('create', Branch::class) ?? false,
                'merge' => $request->user()?->can('merge', Branch::class) ?? false,
            ],
        ]);
    }

    /**
     * Store a newly created branch in storage.
     */
    public function store(StoreBranchRequest $request): RedirectResponse
    {
        $data = new CreateBranchData(
            businessId: (int) $request->validated('business_id'),
            location: (string) $request->validated('location'),
        );

        $this->branchService->createBranch($data, $request->user());

        return back()->with('status', 'Branch created successfully');
    }

    /**
     * Update the specified branch in storage.
     */
    public function update(UpdateBranchRequest $request, Branch $branch): RedirectResponse
    {
        $data = new UpdateBranchData(
            location: (string) $request->validated('location'),
        );

        $this->branchService->updateBranch($branch, $data, $request->user());

        return back()->with('status', 'Branch updated successfully');
    }

    /**
     * Re-parent a branch to a new business.
     */
    public function reparent(ReparentBranchRequest $request, Branch $branch): RedirectResponse
    {
        $data = new ReparentBranchData(
            branchId: $branch->id,
            newBusinessId: (int) $request->validated('new_business_id'),
        );

        $this->branchService->reparentBranch($data, $request->user());

        return back()->with('status', 'Branch re-parented successfully');
    }

    /**
     * Merge duplicate branches.
     */
    public function merge(MergeBranchRequest $request): RedirectResponse
    {
        $data = new MergeBranchData(
            sourceBranchId: (int) $request->validated('source_branch_id'),
            targetBranchId: (int) $request->validated('target_branch_id'),
        );

        $this->branchService->mergeBranches($data, $request->user());

        return back()->with('status', 'Branches merged successfully');
    }
}
