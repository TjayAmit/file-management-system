<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateBranchData;
use App\DTOs\MergeBranchData;
use App\DTOs\ReparentBranchData;
use App\DTOs\UpdateBranchData;
use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Services\BranchService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly BranchService $branchService,
    ) {}

    /**
     * Display a listing of branches (supports business_id filter and location typeahead query).
     */
    public function index(Request $request): JsonResponse
    {
        $businessId = $request->query('business_id') !== null ? (int) $request->query('business_id') : null;
        $query = (string) $request->query('query', '');

        $branches = $this->branchService->searchBranches($businessId, $query);

        return $this->successResponse($branches, 'Branches retrieved successfully');
    }

    /**
     * Store a newly created branch.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_id' => ['required', 'integer', 'exists:businesses,id'],
            'location' => ['required', 'string', 'max:255'],
        ]);

        $data = new CreateBranchData(
            businessId: (int) $validated['business_id'],
            location: (string) $validated['location'],
        );

        $branch = $this->branchService->createBranch($data);

        return $this->successResponse($branch, 'Branch created successfully', 201);
    }

    /**
     * Update the specified branch.
     */
    public function update(Request $request, Branch $branch): JsonResponse
    {
        $validated = $request->validate([
            'location' => ['required', 'string', 'max:255'],
        ]);

        $data = new UpdateBranchData(
            location: (string) $validated['location'],
        );

        $updatedBranch = $this->branchService->updateBranch($branch, $data);

        return $this->successResponse($updatedBranch, 'Branch updated successfully');
    }

    /**
     * Re-parent a branch to a new business.
     */
    public function reparent(Request $request, Branch $branch): JsonResponse
    {
        $validated = $request->validate([
            'new_business_id' => ['required', 'integer', 'exists:businesses,id'],
        ]);

        $data = new ReparentBranchData(
            branchId: $branch->id,
            newBusinessId: (int) $validated['new_business_id'],
        );

        $reparentedBranch = $this->branchService->reparentBranch($data, $request->user());

        return $this->successResponse($reparentedBranch, 'Branch re-parented successfully');
    }

    /**
     * Merge duplicate branches.
     */
    public function merge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source_branch_id' => ['required', 'integer', 'exists:branches,id'],
            'target_branch_id' => ['required', 'integer', 'exists:branches,id', 'different:source_branch_id'],
        ]);

        $data = new MergeBranchData(
            sourceBranchId: (int) $validated['source_branch_id'],
            targetBranchId: (int) $validated['target_branch_id'],
        );

        $targetBranch = $this->branchService->mergeBranches($data, $request->user());

        return $this->successResponse($targetBranch, 'Branches merged successfully');
    }
}
