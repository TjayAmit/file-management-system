<?php

namespace App\Http\Requests\Document;

use App\Models\Document;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Document::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'query' => ['nullable', 'string', 'max:255'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'request_type_id' => ['nullable', 'integer', 'exists:request_types,id'],
            'storage_location_id' => ['nullable', 'integer', 'exists:storage_locations,id'],
            'per_page' => ['nullable', 'integer', Rule::in([15, 25, 50, 100])],
            'page' => ['nullable', 'integer', 'min:1', 'max:10000'],
        ];
    }

    /**
     * The validated filter set, as the repository expects it.
     *
     * @return array{query: string, branch_id: int|null, request_type_id: int|null, storage_location_id: int|null}
     */
    public function filters(): array
    {
        return [
            'query' => trim((string) $this->validated('query', '')),
            'branch_id' => $this->validated('branch_id') !== null ? (int) $this->validated('branch_id') : null,
            'request_type_id' => $this->validated('request_type_id') !== null ? (int) $this->validated('request_type_id') : null,
            'storage_location_id' => $this->validated('storage_location_id') !== null ? (int) $this->validated('storage_location_id') : null,
        ];
    }

    /**
     * How many documents to show per page.
     */
    public function perPage(): int
    {
        return (int) ($this->validated('per_page') ?? 25);
    }
}
