<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Services\ActivityService;
use App\Services\DocumentService;
use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly SearchService $searchService,
        private readonly ActivityService $activityService,
    ) {}

    /**
     * The staff landing page: what the index holds, where the paper is, and
     * whether the archive is being found (PLAN.md 5.2).
     */
    public function __invoke(Request $request): InertiaResponse
    {
        $user = $request->user();
        $canSeeReport = Gate::allows('view-search-report');

        return Inertia::render('dashboard', [
            'statistics' => $this->documentService->getDashboardStatistics(),
            'hitRate' => $canSeeReport ? $this->searchService->hitRateReport() : null,
            'recentActivity' => $user?->isAdmin() ? $this->activityService->getActivities(8)->items() : null,
            'can' => [
                'encode' => $user?->can('create', Document::class) ?? false,
                'viewReport' => $canSeeReport,
            ],
        ]);
    }
}
