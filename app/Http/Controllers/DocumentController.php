<?php

namespace App\Http\Controllers;

use App\DTOs\CreateDocumentData;
use App\Services\DocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentService $documentService,
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
    public function show(string $reference): InertiaResponse
    {
        $document = $this->documentService->getDocumentByReference($reference);

        if (! $document) {
            abort(404, 'Document not found');
        }

        return Inertia::render('documents/show', [
            'document' => $document,
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
}
