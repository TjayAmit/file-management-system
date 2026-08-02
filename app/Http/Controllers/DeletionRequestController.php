<?php

namespace App\Http\Controllers;

use App\Models\DeletionRequest;
use App\Services\DocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DeletionRequestController extends Controller
{
    public function __construct(
        private readonly DocumentService $documentService,
    ) {}

    /**
     * Approve a pending deletion request, soft-deleting the document.
     */
    public function approve(Request $request, DeletionRequest $deletionRequest): RedirectResponse
    {
        $this->documentService->approveDeletion($deletionRequest, $request->user());

        return back()->with('status', 'Deletion request approved');
    }

    /**
     * Reject a pending deletion request, restoring the document to search.
     */
    public function reject(Request $request, DeletionRequest $deletionRequest): RedirectResponse
    {
        $this->documentService->rejectDeletion($deletionRequest, $request->user());

        return back()->with('status', 'Deletion request rejected');
    }
}
