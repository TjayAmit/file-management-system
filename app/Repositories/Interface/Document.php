<?php

namespace App\Repositories\Interface;

use App\DTOs\CreateDocumentData;
use App\DTOs\ReplaceDocumentFileData;
use App\DTOs\UpdateDocumentData;
use App\Models\ChangeHistory;
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
}
