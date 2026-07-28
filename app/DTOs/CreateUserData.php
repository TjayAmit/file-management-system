<?php

namespace App\DTOs;

final readonly class CreateUserData
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $role = 'viewer',
        public bool $isActive = true,
    ) {}
}
