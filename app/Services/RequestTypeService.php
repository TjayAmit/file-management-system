<?php

namespace App\Services;

use App\DTOs\CreateRequestTypeData;
use App\DTOs\MergeRequestTypeData;
use App\DTOs\UpdateRequestTypeData;
use App\Models\RequestType as RequestTypeModel;
use App\Models\User;
use App\Repositories\Interface\RequestType as RequestTypeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RequestTypeService
{
    public function __construct(
        private readonly RequestTypeRepositoryInterface $requestTypeRepository,
    ) {}

    /**
     * Get all request types.
     *
     * @return Collection<int, RequestTypeModel>
     */
    public function getAllRequestTypes(): Collection
    {
        return $this->requestTypeRepository->all();
    }

    /**
     * Search request types for typeahead suggestions.
     *
     * @return Collection<int, RequestTypeModel>
     */
    public function searchRequestTypes(string $query): Collection
    {
        return $this->requestTypeRepository->search($query);
    }

    /**
     * Find request type by ID.
     */
    public function getRequestTypeById(int $id): ?RequestTypeModel
    {
        return $this->requestTypeRepository->findById($id);
    }

    /**
     * Create a new request type.
     */
    public function createRequestType(CreateRequestTypeData $data, ?User $user = null): RequestTypeModel
    {
        return $this->requestTypeRepository->create($data, $user);
    }

    /**
     * Update an existing request type.
     */
    public function updateRequestType(RequestTypeModel $requestType, UpdateRequestTypeData $data, ?User $user = null): RequestTypeModel
    {
        return $this->requestTypeRepository->update($requestType, $data, $user);
    }

    /**
     * Merge source request type into target request type.
     */
    public function mergeRequestTypes(MergeRequestTypeData $data, ?User $user = null): RequestTypeModel
    {
        return $this->requestTypeRepository->merge($data, $user);
    }
}
