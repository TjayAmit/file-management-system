<?php

namespace App\Http\Requests\Admin;

use App\Concerns\ProfileValidationRules;
use App\Http\Requests\StrictFormRequest;
use App\Models\User;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends StrictFormRequest
{
    use ProfileValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->route('user');

        return $user instanceof User
            && ($this->user()?->can('update', $user) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $user = $this->route('user');
        $userId = $user instanceof User ? $user->id : null;

        return [
            'name' => ['sometimes', ...$this->nameRules()],
            'email' => ['sometimes', ...$this->emailRules($userId)],
            'role' => ['sometimes', 'string', Rule::in(User::ROLES)],
            'is_active' => ['sometimes', 'boolean'],
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
            'name' => is_string($name) ? trim((string) preg_replace('/\s+/u', ' ', $name)) : null,
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
            'email.unique' => 'Another account already uses this email address.',
            'name.regex' => 'A name may only contain letters, spaces, and ordinary name punctuation.',
            'role.in' => 'Choose one of: viewer, editor, admin.',
        ];
    }
}
