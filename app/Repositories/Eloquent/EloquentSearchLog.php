<?php

namespace App\Repositories\Eloquent;

use App\Models\SearchLog as SearchLogModel;
use App\Models\User;
use App\Repositories\Interface\SearchLog as SearchLogRepositoryInterface;

class EloquentSearchLog implements SearchLogRepositoryInterface
{
    public function findById(int $id): ?SearchLogModel
    {
        return SearchLogModel::find($id);
    }

    public function create(User $user, string $query, int $resultCount): SearchLogModel
    {
        return SearchLogModel::create([
            'user_id' => $user->id,
            'query' => $query,
            'result_count' => $resultCount,
        ]);
    }

    public function markOpened(SearchLogModel $searchLog, int $documentId): SearchLogModel
    {
        $searchLog->update(['opened_document_id' => $documentId]);

        return $searchLog;
    }

    public function hitRateReport(): array
    {
        $total = SearchLogModel::query()->count();
        $hits = SearchLogModel::query()->whereNotNull('opened_document_id')->count();
        $misses = $total - $hits;

        return [
            'total' => $total,
            'hits' => $hits,
            'misses' => $misses,
            'hit_rate' => $total > 0 ? round(($hits / $total) * 100, 2) : 0.0,
        ];
    }
}
