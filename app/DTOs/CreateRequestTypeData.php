<?php

namespace App\DTOs;

final readonly class CreateRequestTypeData
{
    public function __construct(
        public string $name,
    ) {}
}
