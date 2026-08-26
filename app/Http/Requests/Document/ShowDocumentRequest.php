<?php

namespace App\Http\Requests\Document;

use App\Http\Requests\StrictFormRequest;

class ShowDocumentRequest extends StrictFormRequest
{
    /**
     * Authorization is done in the controller, which resolves the document
     * from its opaque reference before checking the policy.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'search_log' => ['nullable', 'integer', 'min:1', 'exists:search_logs,id'],
        ];
    }

    /**
     * The search log this document was opened from, if any (PLAN.md §5.3).
     */
    public function searchLogId(): ?int
    {
        $searchLogId = $this->validated('search_log');

        return $searchLogId !== null ? (int) $searchLogId : null;
    }
}
