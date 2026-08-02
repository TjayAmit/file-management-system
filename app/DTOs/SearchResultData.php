<?php

namespace App\DTOs;

use App\Enums\SearchState;
use App\Models\Business as BusinessModel;
use App\Models\Document as DocumentModel;
use Illuminate\Database\Eloquent\Collection;
use JsonSerializable;

/**
 * @property-read Collection<int, DocumentModel> $documents
 */
final readonly class SearchResultData implements JsonSerializable
{
    /**
     * @param  Collection<int, DocumentModel>  $documents
     */
    public function __construct(
        public SearchState $state,
        public ?BusinessModel $business,
        public Collection $documents,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return [
            'state' => $this->state->value,
            'business' => $this->business,
            'documents' => $this->documents->values(),
        ];
    }
}
