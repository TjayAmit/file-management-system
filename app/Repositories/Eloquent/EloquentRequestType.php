<?php

namespace App\Repositories\Eloquent;

use App\DTOs\CreateRequestTypeData;
use App\DTOs\MergeRequestTypeData;
use App\DTOs\UpdateRequestTypeData;
use App\Models\Activity;
use App\Models\RequestType as RequestTypeModel;
use App\Models\User;
use App\Repositories\Interface\RequestType as RequestTypeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentRequestType implements RequestTypeRepositoryInterface
{
    /**
     * Get all request types.
     *
     * @return Collection<int, RequestTypeModel>
     */
    public function all(): Collection
    {
        return RequestTypeModel::all();
    }

    /**
     * Search request types by name for typeahead suggestions.
     *
     * @return Collection<int, RequestTypeModel>
     */
    public function search(string $query): Collection
    {
        if (trim($query) === '') {
            return $this->all();
        }

        return RequestTypeModel::where('name', 'like', '%'.$query.'%')
            ->limit(15)
            ->get();
    }

    /**
     * Find a request type by ID.
     */
    public function findById(int $id): ?RequestTypeModel
    {
        return RequestTypeModel::find($id);
    }

    /**
     * Create a new request type.
     */
    public function create(CreateRequestTypeData $data): RequestTypeModel
    {
        /** @var RequestTypeModel $requestType */
        $requestType = RequestTypeModel::create([
            'name' => $data->name,
        ]);

        return $requestType;
    }

    /**
     * Update an existing request type.
     */
    public function update(RequestTypeModel $requestType, UpdateRequestTypeData $data): RequestTypeModel
    {
        $requestType->update([
            'name' => $data->name,
        ]);

        return $requestType;
    }

    /**
     * Merge source request type into target request type.
     */
    public function merge(MergeRequestTypeData $data, ?User $user = null): RequestTypeModel
    {
        /** @var RequestTypeModel $source */
        $source = RequestTypeModel::findOrFail($data->sourceRequestTypeId);
        /** @var RequestTypeModel $target */
        $target = RequestTypeModel::findOrFail($data->targetRequestTypeId);

        $sourceName = $source->name;

        // Re-point all documents from source request type to target request type
        $source->documents()->update([
            'request_type_id' => $target->id,
        ]);

        // Soft delete duplicate source request type
        $source->delete();

        Activity::create([
            'user_id' => $user?->id,
            'subject_type' => RequestTypeModel::class,
            'subject_id' => $target->id,
            'action' => 'request_type.merged',
            'details' => [
                'source_request_type_id' => $data->sourceRequestTypeId,
                'source_name' => $sourceName,
                'target_request_type_id' => $target->id,
                'target_name' => $target->name,
            ],
        ]);

        return $target;
    }
}
