<?php

namespace App\DTOs;

final readonly class BulkSeedBusinessesData
{
    /**
     * @param  array<int, array{name: string, branch: ?string}>  $rows
     */
    public function __construct(
        public array $rows,
    ) {}
}
