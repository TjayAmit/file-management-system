<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rules\Password;

trait PasswordValidationRules
{
    /**
     * Get the validation rules used to validate passwords.
     *
     * @return array<int, Password|ValidationRule|array<mixed>|string>
     */
    protected function passwordRules(): array
    {
        return ['required', 'string', Password::default(), 'confirmed'];
    }

    /**
     * Rules for a password an admin sets on someone else's behalf — account
     * creation and the in-person offline reset (PLAN.md section 6.5).
     *
     * The same strength floor as a self-chosen password, without the
     * confirmation field: the admin reads the password out to the staff
     * member rather than typing it twice.
     *
     * @return array<int, Password|ValidationRule|array<mixed>|string>
     */
    protected function adminAssignedPasswordRules(): array
    {
        return ['required', 'string', Password::default()];
    }

    /**
     * Get the validation rules used to validate the current password.
     *
     * @return array<int, Password|ValidationRule|array<mixed>|string>
     */
    protected function currentPasswordRules(): array
    {
        return ['required', 'string', 'current_password'];
    }
}
