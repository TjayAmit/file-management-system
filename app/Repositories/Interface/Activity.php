<?php

namespace App\Repositories\Interface;

use App\Models\Activity as ActivityModel;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface Activity
{
    /**
     * Paginate activities, most recent first, with the acting user eager loaded.
     *
     * @return LengthAwarePaginator<int, ActivityModel>
     */
    public function paginate(int $perPage = 50): LengthAwarePaginator;
}
