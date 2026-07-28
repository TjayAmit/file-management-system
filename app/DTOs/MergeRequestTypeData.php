<?php

namespace App\DTOs;

final readonly class MergeRequestTypeData
{
    public function __construct(
        public int $sourceRequestTypeId,
        public int $targetRequestTypeId,
    ) {}
}
