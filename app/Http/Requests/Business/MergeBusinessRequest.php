<?php

namespace App\Http\Requests\Business;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;

class MergeBusinessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('merge', Business::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'source_id' => ['required', 'integer', 'exists:businesses,id'],
            'target_id' => ['required', 'integer', 'exists:businesses,id', 'different:source_id'],
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
            'target_id.different' => 'A business cannot be merged into itself.',
        ];
    }
}
