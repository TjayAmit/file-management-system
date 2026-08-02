<?php

namespace App\DTOs;

final readonly class SearchDocumentsData
{
    public function __construct(
        public string $businessQuery,
        public ?int $businessId,
        public ?int $branchId,
        public ?int $requestTypeId,
    ) {}
}
