<?php

namespace App\Http\Requests\Document;

use App\Http\Requests\StrictFormRequest;
use Illuminate\Validation\Rule;

class ServeDocumentRequest extends StrictFormRequest
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
            'action' => ['required', 'string', Rule::in(['view', 'download', 'print'])],
        ];
    }

    /**
     * The access action being logged (PLAN.md §3.5).
     */
    public function action(): string
    {
        return (string) $this->validated('action');
    }
}
