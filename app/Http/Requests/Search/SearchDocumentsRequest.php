<?php

namespace App\Http\Requests\Search;

use Illuminate\Foundation\Http\FormRequest;

class SearchDocumentsRequest extends FormRequest
{
    /**
     * Viewing is open to every authenticated staff account (PLAN.md §3.5);
     * the route's auth middleware is the gate.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'business' => ['nullable', 'string', 'max:255'],
            'business_id' => ['nullable', 'integer', 'exists:businesses,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'request_type_id' => ['nullable', 'integer', 'exists:request_types,id'],
            'location' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * The business name typed by the clerk, trimmed.
     */
    public function businessQuery(): string
    {
        return trim((string) $this->validated('business', ''));
    }

    /**
     * The address typed in the address-first entry point (PLAN.md §3.2).
     */
    public function locationQuery(): string
    {
        return trim((string) $this->validated('location', ''));
    }

    /**
     * An integer filter, or null when it was not supplied.
     */
    public function filterId(string $key): ?int
    {
        $value = $this->validated($key);

        return $value !== null ? (int) $value : null;
    }
}
