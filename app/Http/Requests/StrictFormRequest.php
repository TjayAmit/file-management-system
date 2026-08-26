<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * A form request that accepts only the fields it declares.
 *
 * Laravel's `validated()` already drops undeclared input, so an extra field
 * is normally harmless -- but silent is the problem. A payload carrying
 * `role`, `is_hidden`, or `uploaded_by` is either a client bug or someone
 * probing for mass assignment, and either way the office should hear about
 * it rather than have it quietly ignored.
 *
 * Every request in this application extends this class, so "only what is
 * needed" is the default rather than something each request opts into.
 */
abstract class StrictFormRequest extends FormRequest
{
    /**
     * Framework-managed keys that are never part of a rule set.
     *
     * @var array<int, string>
     */
    private const RESERVED_KEYS = [
        '_token',
        '_method',
        '_headers',
        '_query',
        '_previous',
    ];

    /**
     * The validation rules the request accepts.
     *
     * Declared here so the strict check can read them without going through
     * the container, and so no request can forget to define them.
     *
     * @return array<string, mixed>
     */
    abstract public function rules(): array;

    /**
     * Reject any input field the rules do not declare.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            foreach ($this->unexpectedFields() as $field) {
                $validator->errors()->add(
                    $field,
                    "The {$field} field is not accepted by this form.",
                );
            }
        });

        $this->withStrictValidator($validator);
    }

    /**
     * Hook for subclasses that need cross-field validation of their own.
     *
     * Overriding `withValidator` directly would drop the unknown-field check,
     * so subclasses extend this instead.
     */
    protected function withStrictValidator(Validator $validator): void
    {
        //
    }

    /**
     * Top-level input keys that no rule accounts for.
     *
     * @return array<int, string>
     */
    private function unexpectedFields(): array
    {
        $allowed = $this->allowedFields();

        $submitted = array_map(
            static fn (int|string $key): string => (string) $key,
            array_merge(
                array_keys($this->input()),
                array_keys($this->allFiles()),
            ),
        );

        return array_values(array_diff(
            array_unique($submitted),
            $allowed,
            self::RESERVED_KEYS,
        ));
    }

    /**
     * The top-level field names the rule set declares.
     *
     * `rows.*.name` and `references.*` both authorise the top-level `rows`
     * and `references` keys; nested shape is enforced by the rules themselves.
     * A `confirmed` rule additionally authorises its `_confirmation` partner,
     * which Laravel expects but no rule names.
     *
     * @return array<int, string>
     */
    private function allowedFields(): array
    {
        $rules = $this->rules();

        $allowed = [];

        foreach ($rules as $key => $rule) {
            $field = (string) strtok((string) $key, '.');
            $allowed[] = $field;

            if ($this->ruleRequiresConfirmation($rule)) {
                $allowed[] = $field.'_confirmation';
            }
        }

        return array_values(array_unique($allowed));
    }

    /**
     * Whether a rule set asks Laravel to match a `_confirmation` field.
     */
    private function ruleRequiresConfirmation(mixed $rule): bool
    {
        $parts = is_array($rule) ? $rule : explode('|', (string) (is_string($rule) ? $rule : ''));

        foreach ($parts as $part) {
            if (is_string($part) && ($part === 'confirmed' || str_starts_with($part, 'confirmed:'))) {
                return true;
            }
        }

        return false;
    }
}
