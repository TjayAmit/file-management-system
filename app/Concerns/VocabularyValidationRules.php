<?php

namespace App\Concerns;

trait VocabularyValidationRules
{
    /**
     * Rules for a controlled-vocabulary name (business, request type, storage
     * location) or a branch address.
     *
     * Uniqueness is deliberately NOT enforced: PLAN.md §3.3 makes the
     * vocabularies suggest-only so a genuinely new value is never blocked.
     * The rules below constrain shape only — they reject control characters
     * and markup while leaving ordinary names and addresses untouched.
     *
     * @return array<int, string>
     */
    protected function vocabularyNameRules(bool $required = true): array
    {
        return [
            $required ? 'required' : 'nullable',
            'string',
            'min:2',
            'max:255',
            'regex:/^[\p{L}\p{N}][\p{L}\p{N} \.\,\'’\-\&\(\)\/#]*$/u',
        ];
    }

    /**
     * Collapse runs of whitespace and trim a vocabulary value so that
     * "ABC  Corp " and "ABC Corp" cannot fragment into two entries.
     */
    protected function normalizeVocabularyValue(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        return trim((string) preg_replace('/\s+/u', ' ', $value));
    }
}
