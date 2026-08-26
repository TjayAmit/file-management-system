<?php

namespace App\Http\Requests\RequestType;

use App\Concerns\VocabularyValidationRules;
use App\Models\RequestType;
use Illuminate\Foundation\Http\FormRequest;

class StoreRequestTypeRequest extends FormRequest
{
    use VocabularyValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', RequestType::class) ?? false;
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
            'name.regex' => 'The request type contains characters that are not allowed.',
        ];
    }
}
