<?php

namespace App\Repositories\Interface;

use App\DTOs\CreateDocumentData;
use App\Models\Document as DocumentModel;
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
}
