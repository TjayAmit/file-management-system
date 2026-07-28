<?php

namespace App\Providers;

use App\Repositories\Eloquent\EloquentSystemStatus;
use App\Repositories\Interface\SystemStatus;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(SystemStatus::class, EloquentSystemStatus::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
