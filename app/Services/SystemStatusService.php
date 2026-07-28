<?php

namespace App\Services;

use App\DTOs\SystemStatusData;
use App\Repositories\Interface\SystemStatus;

class SystemStatusService
{
    public function __construct(
        private readonly SystemStatus $systemStatusRepository,
    ) {}

    /**
     * Retrieve the current system status data.
     */
    public function checkStatus(): SystemStatusData
    {
        return $this->systemStatusRepository->getStatus();
    }
}
