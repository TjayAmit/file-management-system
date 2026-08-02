<?php

namespace App\Http\Controllers;

use App\DTOs\CreateDocumentData;
use App\DTOs\ReplaceDocumentFileData;
use App\DTOs\RequestDeletionData;
use App\DTOs\UpdateDocumentData;
use App\Models\ChangeHistory;
use App\Models\DocumentVersion;
use App\Services\BranchService;
use App\Services\DocumentService;
use App\Services\RequestTypeService;
use App\Services\SearchService;
use App\Services\StorageLocationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly SearchService $searchService,
        private readonly BranchService $branchService,
        private readonly RequestTypeService $requestTypeService,
        private readonly StorageLocationService $storageLocationService,
    ) {}

    /**
     * Display a listing of documents.
     */
    public function index(): InertiaResponse
    {
        $documents = $this->documentService->getAllDocuments();

        return Inertia::render('documents/index', [
            'documents' => $documents,
        ]);
    }

    /**
     * Display the specified document.
     */
    public function show(Request $request, string $reference): InertiaResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            abort(404, 'Document not found');
        }

        $validated = $request->validate([
            'search_log' => ['nullable', 'integer'],
        ]);

        if (isset($validated['search_log'])) {
            $this->searchService->recordOpenedDocument((int) $validated['search_log'], $document->id);
        }

        return Inertia::render('documents/show', [
            'document' => $document,
            'storageLocations' => $this->storageLocationService->getAllStorageLocations(),
        ]);
    }

    /**
     * Show the form for encoding a document not yet in the system.
     *
     * Reached from a failed search (PLAN.md §6.3): the upload sits on the
     * critical path to printing the client's copy, so it must precede it.
     */
    public function create(Request $request): InertiaResponse
    {
        $validated = $request->validate([
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ]);

        return Inertia::render('documents/create', [
            'branches' => $this->branchService->getAllBranches(),
            'requestTypes' => $this->requestTypeService->getAllRequestTypes(),
            'storageLocations' => $this->storageLocationService->getAllStorageLocations(),
            'filters' => [
                'branch_id' => isset($validated['branch_id']) ? (int) $validated['branch_id'] : null,
            ],
        ]);
    }

    /**
     * Store a newly created document in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'request_type_id' => ['required', 'integer', 'exists:request_types,id'],
            'storage_location_id' => ['required', 'integer', 'exists:storage_locations,id'],
            'title' => ['required', 'string', 'max:255'],
            'document_date' => ['required', 'date'],
            'approval_date' => ['nullable', 'date'],
            'request_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string'],
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
        ]);

        /** @var UploadedFile $file */
        $file = $request->file('file');

        $data = new CreateDocumentData(
            branchId: (int) $validated['branch_id'],
            requestTypeId: (int) $validated['request_type_id'],
            storageLocationId: (int) $validated['storage_location_id'],
            title: (string) $validated['title'],
            documentDate: (string) $validated['document_date'],
            approvalDate: isset($validated['approval_date']) ? (string) $validated['approval_date'] : null,
            requestDate: isset($validated['request_date']) ? (string) $validated['request_date'] : null,
            remarks: isset($validated['remarks']) ? (string) $validated['remarks'] : null,
            file: $file,
            encodedBy: $request->user(),
        );

        $document = $this->documentService->createDocument($data);

        return redirect()->route('documents.show', $document->reference)->with('status', 'Document encoded successfully');
    }

    /**
     * Update document metadata.
     */
    public function update(Request $request, string $reference): RedirectResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            abort(404, 'Document not found');
        }

        $validated = $request->validate([
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'request_type_id' => ['nullable', 'integer', 'exists:request_types,id'],
            'storage_location_id' => ['nullable', 'integer', 'exists:storage_locations,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'approval_date' => ['nullable', 'date'],
            'request_date' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string'],
        ]);

        $data = new UpdateDocumentData(
            branchId: isset($validated['branch_id']) ? (int) $validated['branch_id'] : null,
            requestTypeId: isset($validated['request_type_id']) ? (int) $validated['request_type_id'] : null,
            storageLocationId: isset($validated['storage_location_id']) ? (int) $validated['storage_location_id'] : null,
            title: isset($validated['title']) ? (string) $validated['title'] : null,
            approvalDate: isset($validated['approval_date']) ? (string) $validated['approval_date'] : null,
            requestDate: isset($validated['request_date']) ? (string) $validated['request_date'] : null,
            remarks: isset($validated['remarks']) ? (string) $validated['remarks'] : null,
            updatedBy: $request->user(),
        );

        $this->documentService->updateDocument($document, $data);

        return back()->with('status', 'Document metadata updated successfully');
    }

    /**
     * Revert a change history entry.
     */
    public function revert(Request $request, string $reference, ChangeHistory $changeHistory): RedirectResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            abort(404, 'Document not found');
        }

        $this->documentService->revertDocument($document, $changeHistory, $request->user());

        return back()->with('status', 'Document metadata reverted successfully');
    }

    /**
     * Replace document PDF file scan.
     */
    public function replaceFile(Request $request, string $reference): RedirectResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            abort(404, 'Document not found');
        }

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
        ]);

        /** @var UploadedFile $file */
        $file = $request->file('file');

        $data = new ReplaceDocumentFileData(
            file: $file,
            user: $request->user(),
        );

        $this->documentService->replaceDocumentFile($document, $data);

        return back()->with('status', 'Document file replaced successfully');
    }

    /**
     * Revert document to a previous file version.
     */
    public function revertFileVersion(Request $request, string $reference, DocumentVersion $version): RedirectResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            abort(404, 'Document not found');
        }

        $this->documentService->revertDocumentFileVersion($document, $version, $request->user());

        return back()->with('status', 'Document file version reverted successfully');
    }

    /**
     * Serve the document's PDF for viewing, downloading, or printing.
     */
    public function serveFile(Request $request, string $reference): StreamedResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            abort(404, 'Document not found');
        }

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:view,download,print'],
        ]);

        return $this->documentService->serveDocument($document, (string) $validated['action'], $request->user());
    }

    /**
     * Generate a printable QR code (SVG) encoding the document's opaque reference.
     */
    public function qrCode(string $reference): Response
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            abort(404, 'Document not found');
        }

        $svg = $this->documentService->generateQrCodeSvg($document);

        return response($svg, 200, ['Content-Type' => 'image/svg+xml']);
    }

    /**
     * File a deletion request for a document.
     */
    public function requestDeletion(Request $request, string $reference): RedirectResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            abort(404, 'Document not found');
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $data = new RequestDeletionData(
            reason: (string) $validated['reason'],
            requestedBy: $request->user(),
        );

        $this->documentService->requestDeletion($document, $data);

        return back()->with('status', 'Deletion request filed successfully');
    }
}
