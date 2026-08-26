<?php

namespace App\Http\Requests\Document;

use App\Http\Requests\StrictFormRequest;
use App\Models\Document;
use Illuminate\Validation\Validator;

class StoreDocumentRequest extends StrictFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Document::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * The four mandatory fields are fixed by PLAN.md §6.8 — business/branch,
     * request type, and the main date — because a blank one of those makes
     * the document unfindable. A title is required on top of those so a result
     * list is readable at a glance.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'request_type_id' => ['required', 'integer', 'exists:request_types,id'],
            'storage_location_id' => ['required', 'integer', 'exists:storage_locations,id'],
            'title' => ['required', 'string', 'max:255'],
            'document_date' => ['required', 'date', 'before_or_equal:today', 'after_or_equal:1900-01-01'],
            'approval_date' => ['nullable', 'date', 'before_or_equal:today', 'after_or_equal:1900-01-01'],
            'request_date' => ['nullable', 'date', 'before_or_equal:today', 'after_or_equal:1900-01-01'],
            'file' => ['required', 'file', 'mimes:pdf', 'mimetypes:application/pdf', 'max:20480'],
        ];
    }

    /**
     * Configure extra validation that spans several fields.
     */
    protected function withStrictValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $approval = $this->input('approval_date');
            $request = $this->input('request_date');

            if (is_string($approval) && is_string($request) && $approval !== '' && $request !== '' && strtotime($approval) < strtotime($request)) {
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
            'branch_id.required' => 'Choose the branch this document belongs to.',
            'request_type_id.required' => 'Choose the kind of request this document is.',
            'storage_location_id.required' => 'Say where the paper original is kept.',
            'document_date.required' => 'Enter the date printed on the document.',
            'document_date.before_or_equal' => 'The document date cannot be in the future.',
            'approval_date.before_or_equal' => 'The approval date cannot be in the future.',
            'request_date.before_or_equal' => 'The request date cannot be in the future.',
            'file.required' => 'Attach the scanned PDF.',
            'file.mimes' => 'The scan must be a PDF file.',
            'file.mimetypes' => 'The scan must be a real PDF file.',
            'file.max' => 'The scan may not be larger than 20 MB.',
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
            'document_date' => 'document date',
            'file' => 'scanned PDF',
        ];
    }
}
