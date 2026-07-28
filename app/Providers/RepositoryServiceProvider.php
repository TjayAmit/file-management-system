<?php

namespace App\Providers;

use App\Repositories\Eloquent\EloquentBusiness;
use App\Repositories\Eloquent\EloquentSystemStatus;
use App\Repositories\Eloquent\EloquentUser;
use App\Repositories\Interface\Business as BusinessRepositoryInterface;
use App\Repositories\Interface\SystemStatus;
use App\Repositories\Interface\User as UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(SystemStatus::class, EloquentSystemStatus::class);
        $this->app->bind(UserRepositoryInterface::class, EloquentUser::class);
        $this->app->bind(BusinessRepositoryInterface::class, EloquentBusiness::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
