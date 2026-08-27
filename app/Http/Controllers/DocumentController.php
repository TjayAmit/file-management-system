<?php

namespace App\Http\Controllers;

use App\DTOs\CreateDocumentData;
use App\DTOs\ReplaceDocumentFileData;
use App\DTOs\RequestDeletionData;
use App\DTOs\UpdateDocumentData;
use App\Http\Requests\Document\CreateDocumentRequest;
use App\Http\Requests\Document\IndexDocumentRequest;
use App\Http\Requests\Document\QrLabelsRequest;
use App\Http\Requests\Document\ReplaceDocumentFileRequest;
use App\Http\Requests\Document\RequestDeletionRequest;
use App\Http\Requests\Document\ServeDocumentRequest;
use App\Http\Requests\Document\ShowDocumentRequest;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Http\Requests\Document\UpdateDocumentRequest;
use App\Models\AccessLog;
use App\Models\ChangeHistory;
use App\Models\Document;
use App\Models\DocumentVersion;
use App\Services\BranchService;
use App\Services\BusinessService;
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
        private readonly BusinessService $businessService,
        private readonly RequestTypeService $requestTypeService,
        private readonly StorageLocationService $storageLocationService,
    ) {}

    /**
     * Display a filterable, paginated listing of documents.
     */
    public function index(IndexDocumentRequest $request): InertiaResponse
    {
        $filters = $request->filters();

        return Inertia::render('documents/index', [
            'documents' => $this->documentService->paginateDocuments($filters, $request->perPage()),
            'branches' => $this->branchService->getAllBranches(),
            'requestTypes' => $this->requestTypeService->getAllRequestTypes(),
            'storageLocations' => $this->storageLocationService->getAllStorageLocations(),
            'filters' => $filters + ['per_page' => $request->perPage()],
            'can' => [
                'encode' => $request->user()?->can('create', Document::class) ?? false,
            ],
        ]);
    }

    /**
     * Display the specified document.
     */
    public function show(ShowDocumentRequest $request, string $reference): InertiaResponse
    {
        $document = $this->resolveDocument($reference);

        $this->authorize('view', $document);

        $searchLogId = $request->searchLogId();

        if ($searchLogId !== null) {
            $this->searchService->recordOpenedDocument($searchLogId, $document->id);
        }

        $document->load([
            'branch.business',
            'requestType',
            'storageLocation',
            'currentVersion',
            'uploader',
            'versions.uploader',
            'changeHistory.changedBy',
            'deletionRequests.requester',
        ]);

        $canSeeAccessLog = $request->user()?->can('viewAny', AccessLog::class) ?? false;

        return Inertia::render('documents/show', [
            'document' => $document,
            'storageLocations' => $this->storageLocationService->getAllStorageLocations(),
            'branches' => $this->branchService->getAllBranches(),
            'requestTypes' => $this->requestTypeService->getAllRequestTypes(),
            'accessLogs' => $canSeeAccessLog ? $this->documentService->getAccessLogsFor($document) : null,
            'can' => [
                'update' => $request->user()?->can('update', $document) ?? false,
                'replaceFile' => $request->user()?->can('replaceFile', $document) ?? false,
                'revert' => $request->user()?->can('revert', $document) ?? false,
                'requestDeletion' => $request->user()?->can('requestDeletion', $document) ?? false,
                'viewAccessLog' => $canSeeAccessLog,
                'printLabel' => $request->user()?->can('create', Document::class) ?? false,
            ],
        ]);
    }

    /**
     * Show the form for encoding a document not yet in the system.
     *
     * Reached from a failed search (PLAN.md 6.3): the upload sits on the
     * critical path to printing the client's copy, so it must precede it.
     */
    public function create(CreateDocumentRequest $request): InertiaResponse
    {
        return Inertia::render('documents/create', [
            'businesses' => $this->businessService->getAllBusinesses(),
            'branches' => $this->branchService->getAllBranches(),
            'requestTypes' => $this->requestTypeService->getAllRequestTypes(),
            'storageLocations' => $this->storageLocationService->getAllStorageLocations(),
            'filters' => [
                'branch_id' => $request->branchId(),
            ],
        ]);
    }

    /**
     * Store a newly created document in storage.
     */
    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        /** @var UploadedFile $file */
        $file = $request->file('file');

        $data = new CreateDocumentData(
            branchId: (int) $request->validated('branch_id'),
            requestTypeId: (int) $request->validated('request_type_id'),
            storageLocationId: (int) $request->validated('storage_location_id'),
            title: (string) $request->validated('title'),
            documentDate: (string) $request->validated('document_date'),
            approvalDate: $request->validated('approval_date') !== null ? (string) $request->validated('approval_date') : null,
            requestDate: $request->validated('request_date') !== null ? (string) $request->validated('request_date') : null,
            file: $file,
            encodedBy: $request->user(),
        );

        $document = $this->documentService->createDocument($data);

        return redirect()->route('documents.show', $document->reference)->with('status', 'Document encoded successfully');
    }

    /**
     * Update document metadata.
     */
    public function update(UpdateDocumentRequest $request, string $reference): RedirectResponse
    {
        $document = $this->resolveDocument($reference);

        $this->authorize('update', $document);

        $data = new UpdateDocumentData(
            branchId: $request->validated('branch_id') !== null ? (int) $request->validated('branch_id') : null,
            requestTypeId: $request->validated('request_type_id') !== null ? (int) $request->validated('request_type_id') : null,
            storageLocationId: $request->validated('storage_location_id') !== null ? (int) $request->validated('storage_location_id') : null,
            title: $request->validated('title') !== null ? (string) $request->validated('title') : null,
            approvalDate: $request->validated('approval_date') !== null ? (string) $request->validated('approval_date') : null,
            requestDate: $request->validated('request_date') !== null ? (string) $request->validated('request_date') : null,
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
        $document = $this->resolveDocument($reference);

        $this->authorize('revert', $document);

        $this->documentService->revertDocument($document, $changeHistory, $request->user());

        return back()->with('status', 'Document metadata reverted successfully');
    }

    /**
     * Replace document PDF file scan.
     */
    public function replaceFile(ReplaceDocumentFileRequest $request, string $reference): RedirectResponse
    {
        $document = $this->resolveDocument($reference);

        $this->authorize('replaceFile', $document);

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
        $document = $this->resolveDocument($reference);

        $this->authorize('revertFileVersion', $document);

        $this->documentService->revertDocumentFileVersion($document, $version, $request->user());

        return back()->with('status', 'Document file version reverted successfully');
    }

    /**
     * Serve the document's PDF for viewing, downloading, or printing.
     */
    public function serveFile(ServeDocumentRequest $request, string $reference): StreamedResponse
    {
        $document = $this->resolveDocument($reference);

        $this->authorize('view', $document);

        return $this->documentService->serveDocument($document, $request->action(), $request->user());
    }

    /**
     * Generate a printable QR code (SVG) encoding the document's opaque reference.
     */
    public function qrCode(string $reference): Response
    {
        $document = $this->resolveDocument($reference);

        $this->authorize('view', $document);

        $svg = $this->documentService->generateQrCodeSvg($document);

        return response($svg, 200, ['Content-Type' => 'image/svg+xml']);
    }

    /**
     * Render a print-ready sheet of QR labels for one or many documents.
     *
     * A QR code only closes the location-tracking loop once it is stuck to
     * the paper (PLAN.md §3.4), so the sheet is cut-and-tape ready and each
     * label carries the card in plain text beside the code.
     */
    public function qrLabels(QrLabelsRequest $request): InertiaResponse
    {
        return Inertia::render('documents/qr-labels', [
            'labels' => $this->documentService->getQrLabels($request->references()),
        ]);
    }

    /**
     * File a deletion request for a document.
     */
    public function requestDeletion(RequestDeletionRequest $request, string $reference): RedirectResponse
    {
        $document = $this->resolveDocument($reference);

        $this->authorize('requestDeletion', $document);

        $data = new RequestDeletionData(
            reason: (string) $request->validated('reason'),
            requestedBy: $request->user(),
        );

        $this->documentService->requestDeletion($document, $data);

        return back()->with('status', 'Deletion request filed successfully');
    }

    /**
     * Resolve a document by its opaque reference or fail with a 404.
     *
     * The reference is the only public handle on a document (PLAN.md 6.9);
     * the internal id is never exposed in a URL.
     */
    private function resolveDocument(string $reference): Document
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            abort(404, 'Document not found');
        }

        return $document;
    }
}
