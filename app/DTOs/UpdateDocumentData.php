<?php

namespace App\DTOs;

use App\Models\User;

final readonly class UpdateDocumentData
{
    public function __construct(
        public ?int $branchId = null,
        public ?int $requestTypeId = null,
        public ?int $storageLocationId = null,
        public ?string $title = null,
        public ?string $approvalDate = null,
        public ?string $requestDate = null,
        public ?string $remarks = null,
        public ?User $updatedBy = null,
    ) {}
}
