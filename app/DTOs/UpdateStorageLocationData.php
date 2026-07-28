<?php

namespace App\DTOs;

final readonly class UpdateStorageLocationData
{
    public function __construct(
        public string $name,
    ) {}
}
