<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Services\ActivityService;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ActivityController extends Controller
{
    public function __construct(
        private readonly ActivityService $activityService,
    ) {}

    /**
     * Display the append-only activity log, most recent first.
     */
    public function index(): InertiaResponse
    {
        $this->authorize('viewAny', Activity::class);

        return Inertia::render('admin/activities/index', [
            'activities' => $this->activityService->getActivities(),
        ]);
    }
}
