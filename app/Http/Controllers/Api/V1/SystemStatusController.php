<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\SystemStatusService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class SystemStatusController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SystemStatusService $systemStatusService,
    ) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(): JsonResponse
    {
        $statusData = $this->systemStatusService->checkStatus();

        return $this->successResponse(
            data: $statusData->toArray(),
            message: 'System status retrieved successfully',
        );
    }
}
