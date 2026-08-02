<?php

namespace App\Repositories\Eloquent;

use App\Models\Activity as ActivityModel;
use App\Repositories\Interface\Activity as ActivityRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentActivity implements ActivityRepositoryInterface
{
    public function paginate(int $perPage = 50): LengthAwarePaginator
    {
        return ActivityModel::with('user')
            ->latest('created_at')
            ->paginate($perPage);
    }
}
