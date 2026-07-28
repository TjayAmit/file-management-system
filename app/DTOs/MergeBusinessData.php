<?php

namespace App\DTOs;

final readonly class MergeBusinessData
{
    public function __construct(
        public int $sourceId,
        public int $targetId,
    ) {}
}
