<?php

namespace App\Repositories\Interface;

use App\DTOs\SystemStatusData;

interface SystemStatus
{
    /**
     * Get system status information.
     */
    public function getStatus(): SystemStatusData;
}
