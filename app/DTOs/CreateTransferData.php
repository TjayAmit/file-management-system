<?php

namespace App\DTOs;

use App\Models\User;

final readonly class CreateTransferData
{
    /**
     * @param  array<int, string>  $references  Opaque document reference tokens to transfer.
     */
    public function __construct(
        public array $references,
        public int $toStorageLocationId,
        public ?string $note,
        public User $performedBy,
    ) {}
}
