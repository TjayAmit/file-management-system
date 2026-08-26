<?php

namespace App\Http\Requests\Document;

use App\Http\Requests\StrictFormRequest;
use App\Models\Document;

class CreateDocumentRequest extends StrictFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Document::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ];
    }

    /**
     * The branch pre-selected by a failed search (PLAN.md §6.3).
     */
    public function branchId(): ?int
    {
        $branchId = $this->validated('branch_id');

        return $branchId !== null ? (int) $branchId : null;
    }
}
