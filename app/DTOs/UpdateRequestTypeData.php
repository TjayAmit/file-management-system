<?php

namespace App\DTOs;

final readonly class UpdateRequestTypeData
{
    public function __construct(
        public string $name,
    ) {}
}
