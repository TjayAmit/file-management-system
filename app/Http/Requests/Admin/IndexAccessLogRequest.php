<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\StrictFormRequest;
use App\Models\AccessLog;
use Illuminate\Validation\Rule;

class IndexAccessLogRequest extends StrictFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', AccessLog::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * A document is filtered by its opaque reference, never by its internal
     * id: the reference is the only handle that belongs in a URL (PLAN.md
     * §6.9).
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'action' => ['nullable', 'string', Rule::in(['view', 'download', 'print'])],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'reference' => ['nullable', 'string', 'uuid', 'exists:documents,reference'],
            'per_page' => ['nullable', 'integer', Rule::in([25, 50, 100])],
            'page' => ['nullable', 'integer', 'min:1', 'max:10000'],
        ];
    }

    /**
     * The validated filter set, as the repository expects it.
     *
     * @return array{action: string|null, user_id: int|null, reference: string|null}
     */
    public function filters(): array
    {
        return [
            'action' => $this->validated('action') !== null ? (string) $this->validated('action') : null,
            'user_id' => $this->validated('user_id') !== null ? (int) $this->validated('user_id') : null,
            'reference' => $this->validated('reference') !== null ? (string) $this->validated('reference') : null,
        ];
    }

    /**
     * How many entries to show per page.
     */
    public function perPage(): int
    {
        return (int) ($this->validated('per_page') ?? 50);
    }
}
