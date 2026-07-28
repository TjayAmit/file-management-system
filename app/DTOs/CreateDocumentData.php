<?php

namespace App\DTOs;

use App\Models\User;
use Illuminate\Http\UploadedFile;

final readonly class CreateDocumentData
{
    public function __construct(
        public int $branchId,
        public int $requestTypeId,
        public int $storageLocationId,
        public string $title,
        public string $documentDate,
        public ?string $approvalDate,
        public ?string $requestDate,
        public ?string $remarks,
        public UploadedFile $file,
        public User $encodedBy,
    ) {}
}
