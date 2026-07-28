<?php

namespace App\DTOs;

final readonly class CreateBusinessData
{
    public function __construct(
        public string $name,
    ) {}
}
