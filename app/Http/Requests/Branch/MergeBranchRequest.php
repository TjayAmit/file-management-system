<?php

namespace App\Http\Requests\Branch;

use App\Http\Requests\StrictFormRequest;
use App\Models\Branch;

class MergeBranchRequest extends StrictFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('merge', Branch::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'source_branch_id' => ['required', 'integer', 'exists:branches,id'],
            'target_branch_id' => ['required', 'integer', 'exists:branches,id', 'different:source_branch_id'],
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
            'target_branch_id.different' => 'A branch cannot be merged into itself.',
        ];
    }
}
