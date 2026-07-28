<?php

namespace App\DTOs;

final readonly class UpdateUserData
{
    public function __construct(
        public ?string $name = null,
        public ?string $email = null,
        public ?string $role = null,
        public ?bool $isActive = null,
        public ?string $password = null,
    ) {}
}
