<?php

namespace App\Services;

use App\DTOs\CreateDocumentData;
use App\DTOs\UpdateDocumentData;
use App\Models\ChangeHistory;
use App\Models\Document as DocumentModel;
use App\Models\User;
use App\Repositories\Interface\Document as DocumentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class DocumentService
{
    public function __construct(
        private readonly DocumentRepositoryInterface $documentRepository,
    ) {}

    /**
     * Get all documents.
     *
     * @return Collection<int, DocumentModel>
     */
    public function getAllDocuments(): Collection
    {
        return $this->documentRepository->all();
    }

    /**
     * Find document by internal ID.
     */
    public function getDocumentById(int $id): ?DocumentModel
    {
        return $this->documentRepository->findById($id);
    }

    /**
     * Find document by opaque reference.
     */
    public function getDocumentByReference(string $reference): ?DocumentModel
    {
        return $this->documentRepository->findByReference($reference);
    }

    /**
     * Create a new document with uploaded PDF.
     */
    public function createDocument(CreateDocumentData $data): DocumentModel
    {
        return $this->documentRepository->create($data);
    }

    /**
     * Update document metadata and track changes.
     */
    public function updateDocument(DocumentModel $document, UpdateDocumentData $data): DocumentModel
    {
        return $this->documentRepository->update($document, $data);
    }

    /**
     * Revert a specific change history entry.
     */
    public function revertDocument(DocumentModel $document, ChangeHistory $changeHistory, User $user): DocumentModel
    {
        return $this->documentRepository->revert($document, $changeHistory, $user);
    }
}
