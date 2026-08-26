<?php

namespace App\Http\Requests\Branch;

use App\Models\Branch;
use Illuminate\Foundation\Http\FormRequest;

class IndexBranchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Branch::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'business_id' => ['nullable', 'integer', 'exists:businesses,id'],
            'query' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * The business filter, if any.
     */
    public function businessId(): ?int
    {
        $businessId = $this->validated('business_id');

        return $businessId !== null ? (int) $businessId : null;
    }

    /**
     * The search term, trimmed.
     */
    public function searchTerm(): string
    {
        return trim((string) $this->validated('query', ''));
    }
}
