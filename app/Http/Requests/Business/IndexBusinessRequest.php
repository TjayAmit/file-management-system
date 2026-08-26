<?php

namespace App\Http\Requests\Business;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;

class IndexBusinessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Business::class) ?? false;
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
        ];
    }

    /**
     * The search term, trimmed.
     */
    public function searchTerm(): string
    {
        return trim((string) $this->validated('query', ''));
    }
}
