<?php

namespace App\Enums;

/**
 * The three states a search must resolve to (PLAN.md §6.1).
 * A bare blank is never a valid outcome.
 */
enum SearchState: string
{
    case Found = 'found';
    case KnownNoDocuments = 'known_no_documents';
    case Unknown = 'unknown';
}
