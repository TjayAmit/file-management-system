<?php

namespace App\Repositories\Eloquent;

use App\DTOs\CreateDocumentData;
use App\Models\Activity;
use App\Models\Document as DocumentModel;
use App\Models\DocumentVersion;
use App\Repositories\Interface\Document as DocumentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class EloquentDocument implements DocumentRepositoryInterface
{
    /**
     * Get all documents.
     *
     * @return Collection<int, DocumentModel>
     */
    public function all(): Collection
    {
        return DocumentModel::with(['branch.business', 'requestType', 'storageLocation', 'currentVersion'])->get();
    }

    /**
     * Find document by internal ID.
     */
    public function findById(int $id): ?DocumentModel
    {
        return DocumentModel::with(['branch.business', 'requestType', 'storageLocation', 'currentVersion', 'versions', 'changeHistories'])->find($id);
    }

    /**
     * Find document by opaque reference token (UUID).
     */
    public function findByReference(string $reference): ?DocumentModel
    {
        return DocumentModel::where('reference', $reference)
            ->with(['branch.business', 'requestType', 'storageLocation', 'currentVersion', 'versions', 'changeHistories'])
            ->first();
    }

    /**
     * Create a new document with uploaded PDF version #1.
     */
    public function create(CreateDocumentData $data): DocumentModel
    {
        $reference = (string) Str::uuid();

        // Save PDF file to private disk
        $path = $data->file->store('documents', 'private');

        /** @var DocumentModel $document */
        $document = DocumentModel::create([
            'reference' => $reference,
            'branch_id' => $data->branchId,
            'request_type_id' => $data->requestTypeId,
            'storage_location_id' => $data->storageLocationId,
            'title' => $data->title,
            'approval_date' => $data->approvalDate ?? $data->documentDate,
            'request_date' => $data->requestDate ?? $data->documentDate,
            'scan_date' => now(),
            'uploaded_by' => $data->encodedBy->id,
            'is_hidden' => false,
        ]);

        DocumentVersion::create([
            'document_id' => $document->id,
            'path' => $path,
            'original_name' => $data->file->getClientOriginalName(),
            'size' => $data->file->getSize(),
            'mime_type' => $data->file->getClientMimeType(),
            'is_current' => true,
            'uploaded_by' => $data->encodedBy->id,
        ]);

        Activity::create([
            'user_id' => $data->encodedBy->id,
            'subject_type' => DocumentModel::class,
            'subject_id' => $document->id,
            'action' => 'document.created',
            'details' => [
                'document_id' => $document->id,
                'reference' => $document->reference,
                'original_name' => $data->file->getClientOriginalName(),
            ],
        ]);

        return $document->load(['branch.business', 'requestType', 'storageLocation', 'currentVersion']);
    }
}
