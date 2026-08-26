<?php

namespace App\Http\Controllers;

use App\Models\DeletionRequest;
use App\Services\DocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DeletionRequestController extends Controller
{
    public function __construct(
        private readonly DocumentService $documentService,
    ) {}

    /**
     * Display deletion requests awaiting an admin decision (PLAN.md 6.7).
     */
    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', DeletionRequest::class);

        return Inertia::render('deletion-requests/index', [
            'deletionRequests' => $this->documentService->getDeletionRequests(),
            'can' => [
                'decide' => $request->user()?->isAdmin() ?? false,
            ],
        ]);
    }

    /**
     * Approve a pending deletion request, soft-deleting the document.
     */
    public function approve(Request $request, DeletionRequest $deletionRequest): RedirectResponse
    {
        $this->authorize('approve', $deletionRequest);

        $this->documentService->approveDeletion($deletionRequest, $request->user());

        return back()->with('status', 'Deletion request approved');
    }

    /**
     * Reject a pending deletion request, restoring the document to search.
     */
    public function reject(Request $request, DeletionRequest $deletionRequest): RedirectResponse
    {
        $this->authorize('reject', $deletionRequest);

        $this->documentService->rejectDeletion($deletionRequest, $request->user());

        return back()->with('status', 'Deletion request rejected');
    }
}
