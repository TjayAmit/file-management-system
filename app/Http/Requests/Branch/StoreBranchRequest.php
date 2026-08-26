<?php

namespace App\Http\Requests\Branch;

use App\Concerns\VocabularyValidationRules;
use App\Http\Requests\StrictFormRequest;
use App\Models\Branch;

class StoreBranchRequest extends StrictFormRequest
{
    use VocabularyValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Branch::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'business_id' => ['required', 'integer', 'exists:businesses,id'],
            'location' => $this->vocabularyNameRules(),
        ];
    }

    /**
     * Normalize input before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'location' => $this->normalizeVocabularyValue($this->input('location')),
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
            'business_id.required' => 'Choose the business this branch belongs to.',
            'location.regex' => 'The branch location contains characters that are not allowed.',
        ];
    }
}
