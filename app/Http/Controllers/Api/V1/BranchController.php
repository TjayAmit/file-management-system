<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateBranchData;
use App\DTOs\MergeBranchData;
use App\DTOs\ReparentBranchData;
use App\DTOs\UpdateBranchData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Branch\IndexBranchRequest;
use App\Http\Requests\Branch\MergeBranchRequest;
use App\Http\Requests\Branch\ReparentBranchRequest;
use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Models\Branch;
use App\Services\BranchService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class BranchController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly BranchService $branchService,
    ) {}

    /**
     * Display a listing of branches (with typeahead query support).
     */
    public function index(IndexBranchRequest $request): JsonResponse
    {
        $branches = $this->branchService->searchBranches($request->businessId(), $request->searchTerm());

        return $this->successResponse($branches, 'Branches retrieved successfully');
    }

    /**
     * Store a newly created branch.
     */
    public function store(StoreBranchRequest $request): JsonResponse
    {
        $data = new CreateBranchData(
            businessId: (int) $request->validated('business_id'),
            location: (string) $request->validated('location'),
        );

        $branch = $this->branchService->createBranch($data, $request->user());

        return $this->successResponse($branch, 'Branch created successfully', 201);
    }

    /**
     * Update the specified branch.
     */
    public function update(UpdateBranchRequest $request, Branch $branch): JsonResponse
    {
        $data = new UpdateBranchData(
            location: (string) $request->validated('location'),
        );

        $updatedBranch = $this->branchService->updateBranch($branch, $data, $request->user());

        return $this->successResponse($updatedBranch, 'Branch updated successfully');
    }

    /**
     * Re-parent a branch to a new business.
     */
    public function reparent(ReparentBranchRequest $request, Branch $branch): JsonResponse
    {
        $data = new ReparentBranchData(
            branchId: $branch->id,
            newBusinessId: (int) $request->validated('new_business_id'),
        );

        $updatedBranch = $this->branchService->reparentBranch($data, $request->user());

        return $this->successResponse($updatedBranch, 'Branch re-parented successfully');
    }

    /**
     * Merge duplicate branches.
     */
    public function merge(MergeBranchRequest $request): JsonResponse
    {
        $data = new MergeBranchData(
            sourceBranchId: (int) $request->validated('source_branch_id'),
            targetBranchId: (int) $request->validated('target_branch_id'),
        );

        $targetBranch = $this->branchService->mergeBranches($data, $request->user());

        return $this->successResponse($targetBranch, 'Branches merged successfully');
    }
}
