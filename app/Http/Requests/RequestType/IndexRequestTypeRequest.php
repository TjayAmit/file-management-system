<?php

namespace App\Http\Requests\RequestType;

use App\Models\RequestType;
use Illuminate\Foundation\Http\FormRequest;

class IndexRequestTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', RequestType::class) ?? false;
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
