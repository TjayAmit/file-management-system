<?php

namespace App\Http\Controllers;

use App\Services\SystemStatusService;
use Illuminate\Http\JsonResponse;

class SystemStatusController extends Controller
{
    public function __construct(
        private readonly SystemStatusService $systemStatusService,
    ) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        $statusData = $this->systemStatusService->checkStatus();

        return response()->json([
            'status' => $statusData->status,
            'version' => $statusData->version,
            'environment' => $statusData->environment,
        ]);
    }
}
