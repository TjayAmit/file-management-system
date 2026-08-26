<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'name' => $this->nameRules(),
            'email' => $this->emailRules($userId),
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * A staff name is letters, spaces, and the punctuation real names carry.
     * Anything else -- angle brackets, control characters, a URL -- is not a
     * name, and the name is rendered wherever accountability is displayed.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return [
            'required',
            'string',
            'min:2',
            'max:120',
            'regex:/^[\p{L}][\p{L}\p{M} \.\,\'\-]*$/u',
        ];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * `email:rfc,dns` is deliberately not used: the office runs offline
     * (PLAN.md section 3.6), so a DNS lookup would make account creation
     * depend on a connection that may be down.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'email:rfc',
            'max:180',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }
}
