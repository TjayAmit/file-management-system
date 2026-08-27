<?php

namespace App\Repositories\Eloquent;

use App\DTOs\CreateDocumentData;
use App\DTOs\ReplaceDocumentFileData;
use App\DTOs\RequestDeletionData;
use App\DTOs\UpdateDocumentData;
use App\Models\AccessLog;
use App\Models\Activity;
use App\Models\Branch;
use App\Models\Business;
use App\Models\ChangeHistory;
use App\Models\DeletionRequest;
use App\Models\Document as DocumentModel;
use App\Models\DocumentVersion;
use App\Models\RequestType;
use App\Models\SearchLog;
use App\Models\StorageLocation;
use App\Models\TransferItem;
use App\Models\User;
use App\Repositories\Interface\Document as DocumentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

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
     * Paginate documents narrowed by the archive-browser filters.
     *
     * @param  array{query: string, branch_id: int|null, request_type_id: int|null, storage_location_id: int|null}  $filters
     * @return LengthAwarePaginator<int, DocumentModel>
     */
    public function paginateFiltered(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = DocumentModel::query()
            ->with(['branch.business', 'requestType', 'storageLocation', 'currentVersion'])
            ->where('is_hidden', false);

        if ($filters['query'] !== '') {
            $term = '%'.str_replace(['%', '_'], ['\%', '\_'], $filters['query']).'%';

            $query->where(function ($builder) use ($term): void {
                $builder->where('title', 'like', $term)
                    ->orWhereHas('branch', fn ($branch) => $branch->where('location', 'like', $term))
                    ->orWhereHas('branch.business', fn ($business) => $business->where('name', 'like', $term));
            });
        }

        foreach (['branch_id', 'request_type_id', 'storage_location_id'] as $column) {
            if ($filters[$column] !== null) {
                $query->where($column, $filters[$column]);
            }
        }

        return $query
            ->orderByRaw('COALESCE(approval_date, request_date) IS NULL')
            ->orderByRaw('COALESCE(approval_date, request_date) DESC')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Deletion requests, pending ones first, then newest first.
     *
     * @return Collection<int, DeletionRequest>
     */
    public function deletionRequests(): Collection
    {
        return DeletionRequest::with(['document.branch.business', 'requester', 'approver'])
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Counts for the dashboard tiles.
     *
     * @return array{documents: int, businesses: int, branches: int, request_types: int, pending_deletions: int, encoded_this_month: int, by_storage_location: array<int, array{name: string, total: int}>}
     */
    public function dashboardStatistics(): array
    {
        $byLocation = StorageLocation::query()
            ->withCount(['documents as total' => fn ($query) => $query->whereNull('deleted_at')])
            ->orderBy('name')
            ->get()
            ->map(fn (StorageLocation $location): array => [
                'name' => $location->name,
                'total' => (int) $location->getAttribute('total'),
            ])
            ->all();

        return [
            'documents' => DocumentModel::query()->count(),
            'businesses' => Business::query()->count(),
            'branches' => Branch::query()->count(),
            'request_types' => RequestType::query()->count(),
            'pending_deletions' => DeletionRequest::query()->where('status', 'pending')->count(),
            'encoded_this_month' => DocumentModel::query()->where('scan_date', '>=', now()->startOfMonth())->count(),
            'by_storage_location' => $byLocation,
        ];
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
     * Find several documents by their opaque references, for QR label printing.
     *
     * Ordered the way a stack of paper is worked through -- by business, then
     * branch -- so the printed sheet matches the pile on the desk.
     *
     * @param  array<int, string>  $references
     * @return Collection<int, DocumentModel>
     */
    public function findManyByReference(array $references): Collection
    {
        return DocumentModel::query()
            ->whereIn('reference', $references)
            ->with(['branch.business', 'requestType', 'storageLocation'])
            ->get()
            ->sortBy([
                fn (DocumentModel $a, DocumentModel $b): int => $a->branch->business->name <=> $b->branch->business->name,
                fn (DocumentModel $a, DocumentModel $b): int => $a->branch->location <=> $b->branch->location,
            ])
            ->values();
    }

    /**
     * Search documents narrowed by business, then optionally branch and request type.
     * Sorted by the operative date (approval date, falling back to request date).
     *
     * @return Collection<int, DocumentModel>
     */
    public function search(int $businessId, ?int $branchId, ?int $requestTypeId): Collection
    {
        return DocumentModel::query()
            ->whereHas('branch', function ($query) use ($businessId) {
                $query->where('business_id', $businessId);
            })
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->when($requestTypeId, fn ($query) => $query->where('request_type_id', $requestTypeId))
            ->where('is_hidden', false)
            ->with(['branch.business', 'requestType', 'storageLocation', 'currentVersion'])
            ->orderByRaw('COALESCE(approval_date, request_date) DESC')
            ->get();
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

    /**
     * Record an access log entry when the document PDF is served.
     */
    public function logAccess(DocumentModel $document, User $user, string $action): AccessLog
    {
        return AccessLog::create([
            'user_id' => $user->id,
            'document_id' => $document->id,
            'action' => $action,
        ]);
    }

    /**
     * Paginate access-log entries for the admin review page.
     *
     * @param  array{action: string|null, user_id: int|null, reference: string|null}  $filters
     * @return LengthAwarePaginator<int, AccessLog>
     */
    public function paginateAccessLogs(array $filters, int $perPage): LengthAwarePaginator
    {
        return AccessLog::query()
            ->with(['user', 'document.branch.business'])
            ->when($filters['action'], fn ($query, $action) => $query->where('action', $action))
            ->when($filters['user_id'], fn ($query, $userId) => $query->where('user_id', $userId))
            ->when($filters['reference'], fn ($query, $reference) => $query->whereHas(
                'document',
                fn ($document) => $document->where('reference', $reference),
            ))
            ->latest('created_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * The most recent access-log entries for one document, newest first.
     *
     * @return Collection<int, AccessLog>
     */
    public function accessLogsFor(DocumentModel $document, int $limit = 25): Collection
    {
        return AccessLog::query()
            ->where('document_id', $document->id)
            ->with('user')
            ->latest('created_at')
            ->latest('id')
            ->limit($limit)
            ->get();
    }

    /**
     * File a deletion request for a document, hiding it from search while pending.
     */
    public function requestDeletion(DocumentModel $document, RequestDeletionData $data): DeletionRequest
    {
        $deletionRequest = DeletionRequest::create([
            'document_id' => $document->id,
            'requested_by' => $data->requestedBy->id,
            'reason' => $data->reason,
            'status' => 'pending',
        ]);

        $document->update(['is_hidden' => true]);

        Activity::create([
            'user_id' => $data->requestedBy->id,
            'subject_type' => DocumentModel::class,
            'subject_id' => $document->id,
            'action' => 'deletion.requested',
            'details' => [
                'deletion_request_id' => $deletionRequest->id,
                'reason' => $data->reason,
            ],
        ]);

        return $deletionRequest;
    }

    /**
     * Approve a pending deletion request, soft-deleting the document.
     */
    public function approveDeletion(DeletionRequest $deletionRequest, User $user): DeletionRequest
    {
        if ($deletionRequest->status !== 'pending') {
            throw new ConflictHttpException('This deletion request has already been decided.');
        }

        $deletionRequest->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'decided_at' => now(),
        ]);

        $document = $deletionRequest->document;
        $document->delete();

        Activity::create([
            'user_id' => $user->id,
            'subject_type' => DocumentModel::class,
            'subject_id' => $document->id,
            'action' => 'deletion.approved',
            'details' => [
                'deletion_request_id' => $deletionRequest->id,
            ],
        ]);

        return $deletionRequest->fresh(['document', 'requester', 'approver']);
    }

    /**
     * Reject a pending deletion request, restoring the document to search.
     */
    public function rejectDeletion(DeletionRequest $deletionRequest, User $user): DeletionRequest
    {
        if ($deletionRequest->status !== 'pending') {
            throw new ConflictHttpException('This deletion request has already been decided.');
        }

        $deletionRequest->update([
            'status' => 'rejected',
            'approved_by' => $user->id,
            'decided_at' => now(),
        ]);

        $document = $deletionRequest->document;
        $document->update(['is_hidden' => false]);

        Activity::create([
            'user_id' => $user->id,
            'subject_type' => DocumentModel::class,
            'subject_id' => $document->id,
            'action' => 'deletion.rejected',
            'details' => [
                'deletion_request_id' => $deletionRequest->id,
            ],
        ]);

        return $deletionRequest->fresh(['document', 'requester', 'approver']);
    }

    /**
     * Purge superseded document versions older than the retention window, removing their files from disk.
     */
    public function purgeExpiredVersions(int $retentionDays = 90): int
    {
        $versions = DocumentVersion::where('is_current', false)
            ->where('created_at', '<', now()->subDays($retentionDays))
            ->get();

        $disk = Storage::disk('private');

        foreach ($versions as $version) {
            $disk->delete($version->path);

            Activity::create([
                'user_id' => null,
                'subject_type' => DocumentModel::class,
                'subject_id' => $version->document_id,
                'action' => 'document_version.purged',
                'details' => [
                    'version_id' => $version->id,
                    'original_name' => $version->original_name,
                ],
            ]);

            $version->delete();
        }

        return $versions->count();
    }

    /**
     * Purge soft-deleted documents older than the retention window, removing their file versions from disk.
     */
    public function purgeExpiredDocuments(int $retentionDays = 90): int
    {
        $documents = DocumentModel::onlyTrashed()
            ->where('deleted_at', '<', now()->subDays($retentionDays))
            ->with('versions')
            ->get();

        $disk = Storage::disk('private');

        foreach ($documents as $document) {
            foreach ($document->versions as $version) {
                $disk->delete($version->path);
            }

            AccessLog::where('document_id', $document->id)->delete();
            SearchLog::where('opened_document_id', $document->id)->update(['opened_document_id' => null]);
            TransferItem::where('document_id', $document->id)->delete();

            Activity::create([
                'user_id' => null,
                'subject_type' => DocumentModel::class,
                'subject_id' => $document->id,
                'action' => 'document.purged',
                'details' => [
                    'reference' => $document->reference,
                ],
            ]);

            $document->forceDelete();
        }

        return $documents->count();
    }
}
