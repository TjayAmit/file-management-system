<?php

namespace App\Http\Requests\RequestType;

use App\Http\Requests\StrictFormRequest;
use App\Models\RequestType;

class MergeRequestTypeRequest extends StrictFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('merge', RequestType::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'source_request_type_id' => ['required', 'integer', 'exists:request_types,id'],
            'target_request_type_id' => ['required', 'integer', 'exists:request_types,id', 'different:source_request_type_id'],
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
            'target_request_type_id.different' => 'A request type cannot be merged into itself.',
        ];
    }
}
