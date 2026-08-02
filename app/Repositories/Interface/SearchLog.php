<?php

namespace App\Repositories\Interface;

use App\Models\SearchLog as SearchLogModel;
use App\Models\User;

interface SearchLog
{
    /**
     * Find a search log by ID.
     */
    public function findById(int $id): ?SearchLogModel;

    /**
     * Record a search: query, result count, and (for now) no opened document.
     */
    public function create(User $user, string $query, int $resultCount): SearchLogModel;

    /**
     * Record that a document was opened from a search's results.
     */
    public function markOpened(SearchLogModel $searchLog, int $documentId): SearchLogModel;

    /**
     * Aggregate hit-rate report (PLAN.md §5.3): a search counts as a hit
     * when a result was opened, a probable miss otherwise.
     *
     * @return array{total: int, hits: int, misses: int, hit_rate: float}
     */
    public function hitRateReport(): array;
}
