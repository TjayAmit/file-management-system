<?php

namespace App\DTOs;

final readonly class UpdateBusinessData
{
    public function __construct(
        public string $name,
    ) {}
}
