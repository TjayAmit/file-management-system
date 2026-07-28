<?php

namespace App\Repositories\Interface;

use App\DTOs\CreateRequestTypeData;
use App\DTOs\MergeRequestTypeData;
use App\DTOs\UpdateRequestTypeData;
use App\Models\RequestType as RequestTypeModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface RequestType
{
    /**
     * Get all request types.
     *
     * @return Collection<int, RequestTypeModel>
     */
    public function all(): Collection;

    /**
     * Search request types by name or code.
     *
     * @return Collection<int, RequestTypeModel>
     */
    public function search(string $query): Collection;

    /**
     * Find request type by ID.
     */
    public function findById(int $id): ?RequestTypeModel;

    /**
     * Create a new request type.
     */
    public function create(CreateRequestTypeData $data): RequestTypeModel;

    /**
     * Update an existing request type.
     */
    public function update(RequestTypeModel $requestType, UpdateRequestTypeData $data): RequestTypeModel;

    /**
     * Merge source request type into target request type.
     */
    public function merge(MergeRequestTypeData $data, ?User $user = null): RequestTypeModel;
}
