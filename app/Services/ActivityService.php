<?php

namespace App\Services;

use App\Models\Activity as ActivityModel;
use App\Repositories\Interface\Activity as ActivityRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ActivityService
{
    public function __construct(
        private readonly ActivityRepositoryInterface $activityRepository,
    ) {}

    /**
     * Paginate activities for the admin review page.
     *
     * @return LengthAwarePaginator<int, ActivityModel>
     */
    public function getActivities(int $perPage = 50): LengthAwarePaginator
    {
        return $this->activityRepository->paginate($perPage);
    }
}
