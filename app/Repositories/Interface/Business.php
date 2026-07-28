<?php

namespace App\Repositories\Interface;

use App\DTOs\CreateBusinessData;
use App\DTOs\MergeBusinessData;
use App\DTOs\UpdateBusinessData;
use App\Models\Business as BusinessModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface Business
{
    /**
     * Get all businesses.
     *
     * @return Collection<int, BusinessModel>
     */
    public function all(): Collection;

    /**
     * Search businesses by name for typeahead suggestions.
     *
     * @return Collection<int, BusinessModel>
     */
    public function search(string $query): Collection;

    /**
     * Find a business by ID.
     */
    public function findById(int $id): ?BusinessModel;

    /**
     * Create a new business.
     */
    public function create(CreateBusinessData $data): BusinessModel;

    /**
     * Update an existing business.
     */
    public function update(BusinessModel $business, UpdateBusinessData $data): BusinessModel;

    /**
     * Merge source business into target business.
     */
    public function merge(MergeBusinessData $data, ?User $user = null): BusinessModel;
}
