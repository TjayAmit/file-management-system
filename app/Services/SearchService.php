<?php

namespace App\Services;

use App\DTOs\SearchDocumentsData;
use App\DTOs\SearchResultData;
use App\Enums\SearchState;
use App\Models\Branch as BranchModel;
use App\Models\SearchLog as SearchLogModel;
use App\Models\User;
use App\Repositories\Interface\Branch as BranchRepositoryInterface;
use App\Repositories\Interface\Business as BusinessRepositoryInterface;
use App\Repositories\Interface\Document as DocumentRepositoryInterface;
use App\Repositories\Interface\SearchLog as SearchLogRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SearchService
{
    public function __construct(
        private readonly BusinessRepositoryInterface $businessRepository,
        private readonly DocumentRepositoryInterface $documentRepository,
        private readonly BranchRepositoryInterface $branchRepository,
        private readonly SearchLogRepositoryInterface $searchLogRepository,
    ) {}

    /**
     * Resolve a search to one of three states (PLAN.md §6.1): found, known
     * business with nothing encoded, or not in the known list. Narrows
     * business → branch → request type, sorted by the operative date.
     * Every search is recorded (PLAN.md §5.3, §6.6).
     */
    public function search(SearchDocumentsData $data, User $user): SearchResultData
    {
        $business = $data->businessId !== null
            ? $this->businessRepository->findById($data->businessId)
            : $this->businessRepository->findByExactName($data->businessQuery);

        $query = $business !== null ? $business->name : $data->businessQuery;

        if (! $business) {
            $searchLog = $this->searchLogRepository->create($user, $query, 0);

            return new SearchResultData(
                state: SearchState::Unknown,
                business: null,
                documents: new Collection,
                searchLogId: $searchLog->id,
            );
        }

        $documents = $this->documentRepository->search($business->id, $data->branchId, $data->requestTypeId);

        $searchLog = $this->searchLogRepository->create($user, $query, $documents->count());

        return new SearchResultData(
            state: $documents->isEmpty() ? SearchState::KnownNoDocuments : SearchState::Found,
            business: $business,
            documents: $documents,
            searchLogId: $searchLog->id,
        );
    }

    /**
     * Address-first entry point (PLAN.md §3.2) — search branches by
     * location when the owner is unknown, surfacing each branch's
     * business and encoded documents. Recorded as a search (PLAN.md §5.3).
     *
     * @return array{branches: Collection<int, BranchModel>, searchLogId: int}
     */
    public function searchByLocation(string $location, User $user): array
    {
        $branches = $this->branchRepository->searchByLocation($location);

        $searchLog = $this->searchLogRepository->create($user, $location, $branches->count());

        return ['branches' => $branches, 'searchLogId' => $searchLog->id];
    }

    /**
     * Record that a document was opened from a search's results — a probable hit.
     */
    public function recordOpenedDocument(int $searchLogId, int $documentId): ?SearchLogModel
    {
        $searchLog = $this->searchLogRepository->findById($searchLogId);

        if (! $searchLog) {
            return null;
        }

        return $this->searchLogRepository->markOpened($searchLog, $documentId);
    }

    /**
     * Aggregate hit-rate report toward the 60% target (PLAN.md §5.3).
     *
     * @return array{total: int, hits: int, misses: int, hit_rate: float}
     */
    public function hitRateReport(): array
    {
        return $this->searchLogRepository->hitRateReport();
    }
}
