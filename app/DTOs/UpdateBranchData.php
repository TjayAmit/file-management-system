<?php

namespace App\DTOs;

final readonly class UpdateBranchData
{
    public function __construct(
        public string $location,
    ) {}
}
