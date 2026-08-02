<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
        return Inertia::render('admin/activities/index', [
            'activities' => $this->activityService->getActivities(),
        ]);
    }
}
