<?php

namespace App\DTOs;

final readonly class CreateBranchData
{
    public function __construct(
        public int $businessId,
        public string $location,
    ) {}
}
