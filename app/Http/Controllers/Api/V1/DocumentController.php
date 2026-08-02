<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateDocumentData;
use App\DTOs\CreateTransferData;
use App\DTOs\ReplaceDocumentFileData;
use App\DTOs\UpdateDocumentData;
use App\Http\Controllers\Controller;
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
    public function index(): JsonResponse
    {
        $documents = $this->documentService->getAllDocuments();

        return $this->successResponse($documents, 'Documents retrieved successfully');
    }

    /**
     * Display the specified document by opaque reference.
     */
    public function show(string $reference): JsonResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

        return $this->successResponse($document, 'Document retrieved successfully');
    }

    /**
     * Store a newly created document.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Document::class);

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

        return $this->successResponse($document, 'Document encoded successfully', 201);
    }

    /**
     * Update document metadata.
     */
    public function update(Request $request, string $reference): JsonResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

        $this->authorize('update', $document);

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

        $updatedDocument = $this->documentService->updateDocument($document, $data);

        return $this->successResponse($updatedDocument, 'Document metadata updated successfully');
    }

    /**
     * Update the document's physical location, sharing the same transfer
     * model as a batch transfer (PLAN.md §6.9) — a single-document transfer
     * is a batch of one.
     */
    public function updateLocation(Request $request, string $reference): JsonResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

        $this->authorize('updateLocation', $document);

        $validated = $request->validate([
            'to_storage_location_id' => ['required', 'integer', 'exists:storage_locations,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $data = new CreateTransferData(
            references: [$reference],
            toStorageLocationId: (int) $validated['to_storage_location_id'],
            note: isset($validated['note']) ? (string) $validated['note'] : null,
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
    public function replaceFile(Request $request, string $reference): JsonResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

        $this->authorize('replaceFile', $document);

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
        ]);

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
