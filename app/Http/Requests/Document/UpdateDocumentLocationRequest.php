<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentLocationRequest extends FormRequest
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
     * Field names match the batch-transfer payload so the companion app uses
     * one shape for both (PLAN.md 6.9).
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'to_storage_location_id' => ['required', 'integer', 'exists:storage_locations,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * The location the paper original has moved to.
     */
    public function toStorageLocationId(): int
    {
        return (int) $this->validated('to_storage_location_id');
    }

    /**
     * The optional note recorded against the move.
     */
    public function note(): ?string
    {
        $note = $this->validated('note');

        return $note !== null ? (string) $note : null;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'to_storage_location_id.required' => 'Choose where the paper original now is.',
        ];
    }
}
