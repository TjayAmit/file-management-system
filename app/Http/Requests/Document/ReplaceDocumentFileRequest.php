<?php

namespace App\Http\Requests\Document;

use App\Http\Requests\StrictFormRequest;

class ReplaceDocumentFileRequest extends StrictFormRequest
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
            'file' => ['required', 'file', 'mimes:pdf', 'mimetypes:application/pdf', 'max:20480'],
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
            'file.required' => 'Attach the replacement scan.',
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
            'file' => 'scanned PDF',
        ];
    }
}
