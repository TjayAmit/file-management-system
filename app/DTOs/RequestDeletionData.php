<?php

namespace App\DTOs;

use App\Models\User;

final readonly class RequestDeletionData
{
    public function __construct(
        public string $reason,
        public User $requestedBy,
    ) {}
}
