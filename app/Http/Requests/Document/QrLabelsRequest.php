<?php

namespace App\Http\Requests\Document;

use App\Http\Requests\StrictFormRequest;
use App\Models\Document;

class QrLabelsRequest extends StrictFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Labelling paper is an editor's job (PLAN.md §6.4) — the same people who
     * encode documents and move them between buildings.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Document::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * The sheet is capped well below the transfer batch limit: each label
     * carries its own inline SVG, so an unbounded stack would build a page
     * no browser wants to print.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'references' => ['required', 'array', 'min:1', 'max:60'],
            'references.*' => ['required', 'string', 'uuid', 'distinct', 'exists:documents,reference'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'references.required' => 'Choose at least one document to print a label for.',
            'references.max' => 'Print at most 60 labels on one sheet.',
            'references.*.exists' => 'One of those documents is not in the system.',
        ];
    }

    /**
     * The document references to print labels for.
     *
     * @return array<int, string>
     */
    public function references(): array
    {
        /** @var array<int, string> $references */
        $references = $this->validated('references');

        return $references;
    }
}
