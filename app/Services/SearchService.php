<?php

namespace App\Services;

use App\DTOs\SearchDocumentsData;
use App\DTOs\SearchResultData;
use App\Enums\SearchState;
use App\Models\Branch as BranchModel;
use App\Repositories\Interface\Branch as BranchRepositoryInterface;
use App\Repositories\Interface\Business as BusinessRepositoryInterface;
use App\Repositories\Interface\Document as DocumentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class SearchService
{
    public function __construct(
        private readonly BusinessRepositoryInterface $businessRepository,
        private readonly DocumentRepositoryInterface $documentRepository,
        private readonly BranchRepositoryInterface $branchRepository,
    ) {}

    /**
     * Resolve a search to one of three states (PLAN.md §6.1): found, known
     * business with nothing encoded, or not in the known list. Narrows
     * business → branch → request type, sorted by the operative date.
     */
    public function search(SearchDocumentsData $data): SearchResultData
    {
        $business = $data->businessId !== null
            ? $this->businessRepository->findById($data->businessId)
            : $this->businessRepository->findByExactName($data->businessQuery);

        if (! $business) {
            return new SearchResultData(
                state: SearchState::Unknown,
                business: null,
                documents: new Collection,
            );
        }

        $documents = $this->documentRepository->search($business->id, $data->branchId, $data->requestTypeId);

        return new SearchResultData(
            state: $documents->isEmpty() ? SearchState::KnownNoDocuments : SearchState::Found,
            business: $business,
            documents: $documents,
        );
    }

    /**
     * Address-first entry point (PLAN.md §3.2) — search branches by
     * location when the owner is unknown, surfacing each branch's
     * business and encoded documents.
     *
     * @return Collection<int, BranchModel>
     */
    public function searchByLocation(string $location): Collection
    {
        return $this->branchRepository->searchByLocation($location);
    }
}
