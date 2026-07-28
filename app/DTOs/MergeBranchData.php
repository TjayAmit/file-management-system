<?php

namespace App\DTOs;

final readonly class MergeBranchData
{
    public function __construct(
        public int $sourceBranchId,
        public int $targetBranchId,
    ) {}
}
