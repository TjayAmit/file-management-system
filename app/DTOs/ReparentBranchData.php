<?php

namespace App\DTOs;

final readonly class ReparentBranchData
{
    public function __construct(
        public int $branchId,
        public int $newBusinessId,
    ) {}
}
