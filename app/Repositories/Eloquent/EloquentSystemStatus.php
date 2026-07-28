<?php

namespace App\Repositories\Eloquent;

use App\DTOs\SystemStatusData;
use App\Repositories\Interface\SystemStatus;

class EloquentSystemStatus implements SystemStatus
{
    /**
     * Get system status information.
     */
    public function getStatus(): SystemStatusData
    {
        return new SystemStatusData(
            status: 'ok',
            version: 'v1',
            environment: (string) config('app.env', 'production'),
            meta: [
                'database' => 'operational',
            ],
        );
    }
}
