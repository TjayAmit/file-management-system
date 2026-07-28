<?php

namespace App\DTOs;

final readonly class CreateStorageLocationData
{
    public function __construct(
        public string $name,
    ) {}
}
