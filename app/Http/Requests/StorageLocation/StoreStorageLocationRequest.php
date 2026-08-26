<?php

namespace App\Http\Requests\StorageLocation;

use App\Concerns\VocabularyValidationRules;
use App\Http\Requests\StrictFormRequest;
use App\Models\StorageLocation;

class StoreStorageLocationRequest extends StrictFormRequest
{
    use VocabularyValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', StorageLocation::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => $this->vocabularyNameRules(),
        ];
    }

    /**
     * Normalize input before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->normalizeVocabularyValue($this->input('name')),
        ]);
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.regex' => 'The storage location name contains characters that are not allowed.',
        ];
    }
}
