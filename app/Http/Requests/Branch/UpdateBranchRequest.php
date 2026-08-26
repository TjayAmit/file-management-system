<?php

namespace App\Http\Requests\Branch;

use App\Concerns\VocabularyValidationRules;
use App\Http\Requests\StrictFormRequest;
use App\Models\Branch;

class UpdateBranchRequest extends StrictFormRequest
{
    use VocabularyValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $branch = $this->route('branch');

        return $branch instanceof Branch
            && ($this->user()?->can('update', $branch) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
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
            'location.regex' => 'The branch location contains characters that are not allowed.',
        ];
    }
}
