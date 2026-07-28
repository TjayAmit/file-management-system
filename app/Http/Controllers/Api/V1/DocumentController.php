<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateDocumentData;
use App\Http\Controllers\Controller;
use App\Services\DocumentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class DocumentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly DocumentService $documentService,
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
}
