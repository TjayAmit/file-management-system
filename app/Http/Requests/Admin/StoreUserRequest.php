<?php

namespace App\Http\Requests\Admin;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    use PasswordValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', User::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => $this->adminAssignedPasswordRules(),
            'role' => ['required', 'string', Rule::in(User::ROLES)],
        ];
    }

    /**
     * Normalize input before validation.
     */
    protected function prepareForValidation(): void
    {
        $email = $this->input('email');
        $name = $this->input('name');

        $this->merge(array_filter([
            'email' => is_string($email) ? mb_strtolower(trim($email)) : null,
            'name' => is_string($name) ? trim($name) : null,
        ], fn ($value): bool => $value !== null));
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'An account already exists for this email address.',
            'role.in' => 'Choose one of: viewer, editor, admin.',
        ];
    }
}
