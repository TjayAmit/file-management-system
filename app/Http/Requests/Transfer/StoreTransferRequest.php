<?php

namespace App\Http\Requests\Transfer;

use App\Http\Requests\StrictFormRequest;
use App\Models\Transfer;

class StoreTransferRequest extends StrictFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Transfer::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'references' => ['required', 'array', 'min:1', 'max:500'],
            'references.*' => ['required', 'string', 'uuid', 'distinct', 'exists:documents,reference'],
            'to_storage_location_id' => ['required', 'integer', 'exists:storage_locations,id'],
            'note' => ['nullable', 'string', 'max:1000'],
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
            'references.required' => 'Select at least one document to transfer.',
            'references.max' => 'Transfer at most 500 documents in one batch.',
            'references.*.distinct' => 'The same document was listed twice in this batch.',
            'references.*.exists' => 'One of the scanned documents is not in the system.',
            'to_storage_location_id.required' => 'Choose where the batch is being moved to.',
        ];
    }

    /**
     * The document references in this batch.
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
