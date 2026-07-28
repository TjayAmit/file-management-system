<?php

namespace App\Repositories\Eloquent;

use App\DTOs\CreateDocumentData;
use App\DTOs\ReplaceDocumentFileData;
use App\DTOs\UpdateDocumentData;
use App\Models\Activity;
use App\Models\ChangeHistory;
use App\Models\Document as DocumentModel;
use App\Models\DocumentVersion;
use App\Models\User;
use App\Repositories\Interface\Document as DocumentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

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
        return DocumentModel::with(['branch.business', 'requestType', 'storageLocation', 'currentVersion', 'versions', 'changeHistories.changedBy'])->find($id);
    }

    /**
     * Find document by opaque reference token (UUID).
     */
    public function findByReference(string $reference): ?DocumentModel
    {
        return DocumentModel::where('reference', $reference)
            ->with(['branch.business', 'requestType', 'storageLocation', 'currentVersion', 'versions', 'changeHistories.changedBy'])
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

    /**
     * Update document metadata and track changes in change_histories.
     */
    public function update(DocumentModel $document, UpdateDocumentData $data): DocumentModel
    {
        $fields = [
            'branch_id' => $data->branchId,
            'request_type_id' => $data->requestTypeId,
            'storage_location_id' => $data->storageLocationId,
            'title' => $data->title,
            'approval_date' => $data->approvalDate,
            'request_date' => $data->requestDate,
        ];

        $payload = [];

        foreach ($fields as $field => $newValue) {
            if ($newValue === null) {
                continue;
            }

            $oldValue = $document->getAttribute($field);

            $oldStr = $oldValue !== null ? (string) $oldValue : null;
            $newStr = (string) $newValue;

            if ($oldStr !== $newStr) {
                $payload[$field] = $newValue;

                ChangeHistory::create([
                    'document_id' => $document->id,
                    'field' => $field,
                    'old_value' => $oldStr,
                    'new_value' => $newStr,
                    'changed_by' => $data->updatedBy?->id,
                    'is_revert' => false,
                ]);
            }
        }

        if (! empty($payload)) {
            $document->update($payload);

            Activity::create([
                'user_id' => $data->updatedBy?->id,
                'subject_type' => DocumentModel::class,
                'subject_id' => $document->id,
                'action' => 'document.updated',
                'details' => [
                    'document_id' => $document->id,
                    'updated_fields' => array_keys($payload),
                ],
            ]);
        }

        /** @var DocumentModel */
        return $document->fresh(['branch.business', 'requestType', 'storageLocation', 'currentVersion', 'changeHistories.changedBy']);
    }

    /**
     * Revert a specific change history entry on a document.
     */
    public function revert(DocumentModel $document, ChangeHistory $changeHistory, User $user): DocumentModel
    {
        // Authorization check: original editor or admin fallback
        if ($changeHistory->changed_by !== $user->id && ! $user->isAdmin()) {
            throw new AccessDeniedHttpException('Only the original editor or an admin can revert this change.');
        }

        $field = $changeHistory->field;
        $currentValue = $document->getAttribute($field);
        $currentStr = $currentValue !== null ? (string) $currentValue : null;
        $revertToValue = $changeHistory->old_value;

        // Apply revert to document
        $document->update([
            $field => $revertToValue,
        ]);

        // Create change history entry marked as is_revert = true
        ChangeHistory::create([
            'document_id' => $document->id,
            'field' => $field,
            'old_value' => $currentStr,
            'new_value' => $revertToValue,
            'changed_by' => $user->id,
            'is_revert' => true,
        ]);

        Activity::create([
            'user_id' => $user->id,
            'subject_type' => DocumentModel::class,
            'subject_id' => $document->id,
            'action' => 'document.reverted',
            'details' => [
                'change_history_id' => $changeHistory->id,
                'field' => $field,
                'reverted_to' => $revertToValue,
            ],
        ]);

        /** @var DocumentModel */
        return $document->fresh(['branch.business', 'requestType', 'storageLocation', 'currentVersion', 'changeHistories.changedBy']);
    }

    /**
     * Replace document file scan, creating a new DocumentVersion and flipping is_current.
     */
    public function replaceFile(DocumentModel $document, ReplaceDocumentFileData $data): DocumentModel
    {
        $path = $data->file->store('documents', 'private');

        // Set existing versions to not current
        $document->versions()->update(['is_current' => false]);

        $newVersion = DocumentVersion::create([
            'document_id' => $document->id,
            'path' => $path,
            'original_name' => $data->file->getClientOriginalName(),
            'size' => $data->file->getSize(),
            'mime_type' => $data->file->getClientMimeType(),
            'is_current' => true,
            'uploaded_by' => $data->user->id,
        ]);

        Activity::create([
            'user_id' => $data->user->id,
            'subject_type' => DocumentModel::class,
            'subject_id' => $document->id,
            'action' => 'document.file_replaced',
            'details' => [
                'document_id' => $document->id,
                'new_version_id' => $newVersion->id,
                'original_name' => $data->file->getClientOriginalName(),
            ],
        ]);

        /** @var DocumentModel */
        return $document->fresh(['branch.business', 'requestType', 'storageLocation', 'currentVersion', 'versions', 'changeHistories.changedBy']);
    }

    /**
     * Revert document to a previous file version.
     */
    public function revertFileVersion(DocumentModel $document, DocumentVersion $version, User $user): DocumentModel
    {
        if ($version->document_id !== $document->id) {
            throw new AccessDeniedHttpException('Version does not belong to this document.');
        }

        // Set all versions to not current
        $document->versions()->update(['is_current' => false]);

        // Mark target version as current
        $version->update(['is_current' => true]);

        Activity::create([
            'user_id' => $user->id,
            'subject_type' => DocumentModel::class,
            'subject_id' => $document->id,
            'action' => 'document.file_version_reverted',
            'details' => [
                'document_id' => $document->id,
                'reverted_version_id' => $version->id,
            ],
        ]);

        /** @var DocumentModel */
        return $document->fresh(['branch.business', 'requestType', 'storageLocation', 'currentVersion', 'versions', 'changeHistories.changedBy']);
    }
}
