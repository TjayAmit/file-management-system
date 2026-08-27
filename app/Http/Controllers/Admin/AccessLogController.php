<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexAccessLogRequest;
use App\Services\DocumentService;
use App\Services\UserService;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AccessLogController extends Controller
{
    public function __construct(
        private readonly DocumentService $documentService,
        private readonly UserService $userService,
    ) {}

    /**
     * Display who has opened which document, newest first (PLAN.md §6.6).
     *
     * The log is recorded at the point the PDF is served; search listings are
     * deliberately absent from it because metadata results would be noise.
     */
    public function index(IndexAccessLogRequest $request): InertiaResponse
    {
        $filters = $request->filters();

        return Inertia::render('admin/access-logs/index', [
            'accessLogs' => $this->documentService->paginateAccessLogs($filters, $request->perPage()),
            'users' => $this->userService->getAllUsers(),
            'filters' => $filters + ['per_page' => $request->perPage()],
        ]);
    }
}
