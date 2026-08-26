<?php

namespace App\Http\Requests\Document;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateDocumentRequest extends FormRequest
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
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'request_type_id' => ['nullable', 'integer', 'exists:request_types,id'],
            'storage_location_id' => ['nullable', 'integer', 'exists:storage_locations,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'approval_date' => ['nullable', 'date', 'before_or_equal:today', 'after_or_equal:1900-01-01'],
            'request_date' => ['nullable', 'date', 'before_or_equal:today', 'after_or_equal:1900-01-01'],
        ];
    }

    /**
     * Configure extra validation that spans several fields.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $approval = $this->input('approval_date');
            $requested = $this->input('request_date');

            if (is_string($approval) && is_string($requested) && $approval !== '' && $requested !== '' && strtotime($approval) < strtotime($requested)) {
                $validator->errors()->add('approval_date', 'The approval date cannot be earlier than the request date.');
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'approval_date.before_or_equal' => 'The approval date cannot be in the future.',
            'request_date.before_or_equal' => 'The request date cannot be in the future.',
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
            'branch_id' => 'branch',
            'request_type_id' => 'request type',
            'storage_location_id' => 'physical location',
        ];
    }
}
