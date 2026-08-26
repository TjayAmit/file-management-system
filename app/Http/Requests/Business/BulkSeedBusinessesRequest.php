<?php

namespace App\Http\Requests\Business;

use App\Concerns\VocabularyValidationRules;
use App\Http\Requests\StrictFormRequest;
use App\Models\Business;

class BulkSeedBusinessesRequest extends StrictFormRequest
{
    use VocabularyValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Business::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'rows' => ['required', 'array', 'min:1', 'max:1000'],
            'rows.*.name' => $this->vocabularyNameRules(),
            'rows.*.branch' => $this->vocabularyNameRules(required: false),
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
            'rows.required' => 'Add at least one business before seeding.',
            'rows.max' => 'Seed at most 1,000 rows at a time.',
            'rows.*.name.required' => 'Every row needs a business name.',
            'rows.*.name.regex' => 'A business name contains characters that are not allowed.',
            'rows.*.branch.regex' => 'A branch location contains characters that are not allowed.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'rows' => 'list',
        ];
    }
}
