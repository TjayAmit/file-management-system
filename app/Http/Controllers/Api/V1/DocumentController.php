<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateDocumentData;
use App\DTOs\CreateTransferData;
use App\DTOs\ReplaceDocumentFileData;
use App\DTOs\UpdateDocumentData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Document\IndexDocumentRequest;
use App\Http\Requests\Document\ReplaceDocumentFileRequest;
use App\Http\Requests\Document\StoreDocumentRequest;
use App\Http\Requests\Document\UpdateDocumentLocationRequest;
use App\Http\Requests\Document\UpdateDocumentRequest;
use App\Models\ChangeHistory;
use App\Models\Document;
use App\Models\DocumentVersion;
use App\Services\DocumentService;
use App\Services\TransferService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class DocumentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly DocumentService $documentService,
        private readonly TransferService $transferService,
    ) {}

    /**
     * Display a listing of documents.
     */
    public function index(IndexDocumentRequest $request): JsonResponse
    {
        $documents = $this->documentService->paginateDocuments($request->filters(), $request->perPage());

        return $this->successResponse($documents, 'Documents retrieved successfully');
    }

    /**
     * Display the specified document by opaque reference.
     */
    public function show(Request $request, string $reference): JsonResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

        $this->authorize('view', $document);

        return $this->successResponse($document, 'Document retrieved successfully');
    }

    /**
     * Store a newly created document.
     */
    public function store(StoreDocumentRequest $request): JsonResponse
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

        return $this->successResponse($document, 'Document encoded successfully', 201);
    }

    /**
     * Update document metadata.
     */
    public function update(UpdateDocumentRequest $request, string $reference): JsonResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

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

        $updatedDocument = $this->documentService->updateDocument($document, $data);

        return $this->successResponse($updatedDocument, 'Document metadata updated successfully');
    }

    /**
     * Update the document's physical location, sharing the same transfer
     * model as a batch transfer (PLAN.md 6.9) -- a single-document transfer
     * is a batch of one.
     */
    public function updateLocation(UpdateDocumentLocationRequest $request, string $reference): JsonResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

        $this->authorize('updateLocation', $document);

        $data = new CreateTransferData(
            references: [$reference],
            toStorageLocationId: $request->toStorageLocationId(),
            note: $request->note(),
            performedBy: $request->user(),
        );

        $this->transferService->createTransfer($data);

        $updatedDocument = $this->documentService->getDocumentByReference($reference);

        return $this->successResponse($updatedDocument, 'Document location updated successfully');
    }

    /**
     * Revert a change history entry.
     */
    public function revert(Request $request, string $reference, ChangeHistory $changeHistory): JsonResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

        $this->authorize('revert', $document);

        $revertedDocument = $this->documentService->revertDocument($document, $changeHistory, $request->user());

        return $this->successResponse($revertedDocument, 'Document metadata reverted successfully');
    }

    /**
     * Replace document PDF file scan.
     */
    public function replaceFile(ReplaceDocumentFileRequest $request, string $reference): JsonResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

        $this->authorize('replaceFile', $document);

        /** @var UploadedFile $file */
        $file = $request->file('file');

        $data = new ReplaceDocumentFileData(
            file: $file,
            user: $request->user(),
        );

        $updatedDocument = $this->documentService->replaceDocumentFile($document, $data);

        return $this->successResponse($updatedDocument, 'Document file replaced successfully');
    }

    /**
     * Revert document to a previous file version.
     */
    public function revertFileVersion(Request $request, string $reference, DocumentVersion $version): JsonResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

        $this->authorize('revertFileVersion', $document);

        $updatedDocument = $this->documentService->revertDocumentFileVersion($document, $version, $request->user());

        return $this->successResponse($updatedDocument, 'Document file version reverted successfully');
    }
}
