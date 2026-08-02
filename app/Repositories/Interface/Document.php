<?php

namespace App\Repositories\Interface;

use App\DTOs\CreateDocumentData;
use App\DTOs\ReplaceDocumentFileData;
use App\DTOs\RequestDeletionData;
use App\DTOs\UpdateDocumentData;
use App\Models\AccessLog;
use App\Models\ChangeHistory;
use App\Models\DeletionRequest;
use App\Models\Document as DocumentModel;
use App\Models\DocumentVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface Document
{
    /**
     * Get all documents.
     *
     * @return Collection<int, DocumentModel>
     */
    public function all(): Collection;

    /**
     * Find document by internal ID.
     */
    public function findById(int $id): ?DocumentModel;

    /**
     * Find document by opaque reference token (UUID).
     */
    public function findByReference(string $reference): ?DocumentModel;

    /**
     * Search documents narrowed by business, then optionally branch and request type.
     * Sorted by the operative date (approval date, falling back to request date).
     *
     * @return Collection<int, DocumentModel>
     */
    public function search(int $businessId, ?int $branchId, ?int $requestTypeId): Collection;

    /**
     * Create a new document with uploaded PDF version #1.
     */
    public function create(CreateDocumentData $data): DocumentModel;

    /**
     * Update document metadata and track changes in change_histories.
     */
    public function update(DocumentModel $document, UpdateDocumentData $data): DocumentModel;

    /**
     * Revert a specific change history entry on a document.
     */
    public function revert(DocumentModel $document, ChangeHistory $changeHistory, User $user): DocumentModel;

    /**
     * Replace document file scan, creating a new DocumentVersion and flipping is_current.
     */
    public function replaceFile(DocumentModel $document, ReplaceDocumentFileData $data): DocumentModel;

    /**
     * Revert document to a previous file version.
     */
    public function revertFileVersion(DocumentModel $document, DocumentVersion $version, User $user): DocumentModel;

    /**
     * Record an access log entry when the document PDF is served.
     */
    public function logAccess(DocumentModel $document, User $user, string $action): AccessLog;

    /**
     * File a deletion request for a document, hiding it from search while pending.
     */
    public function requestDeletion(DocumentModel $document, RequestDeletionData $data): DeletionRequest;

    /**
     * Approve a pending deletion request, soft-deleting the document.
     */
    public function approveDeletion(DeletionRequest $deletionRequest, User $user): DeletionRequest;

    /**
     * Reject a pending deletion request, restoring the document to search.
     */
    public function rejectDeletion(DeletionRequest $deletionRequest, User $user): DeletionRequest;

    /**
     * Purge superseded document versions older than the retention window, removing their files from disk.
     */
    public function purgeExpiredVersions(int $retentionDays = 90): int;

    /**
     * Purge soft-deleted documents older than the retention window, removing their file versions from disk.
     */
    public function purgeExpiredDocuments(int $retentionDays = 90): int;
}
