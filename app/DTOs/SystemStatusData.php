<?php

namespace App\DTOs;

final readonly class SystemStatusData
{
    /**
     * Create a new DTO instance.
     *
     * @param  array<string, mixed>  $meta
     */
    public function __construct(
        public string $status,
        public string $version,
        public string $environment,
        public array $meta = [],
    ) {}

    /**
     * Convert DTO to array representation.
     *
     * @return array{status: string, version: string, environment: string, meta: array<string, mixed>}
     */
    public function toArray(): array
    {
        return [
            'status' => $this->status,
            'version' => $this->version,
            'environment' => $this->environment,
            'meta' => $this->meta,
        ];
    }
}
