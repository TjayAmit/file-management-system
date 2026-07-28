<?php

namespace App\Services;

use App\DTOs\CreateDocumentData;
use App\Models\Document as DocumentModel;
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
}
