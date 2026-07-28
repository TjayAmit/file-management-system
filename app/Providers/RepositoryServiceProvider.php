<?php

namespace App\Providers;

use App\Repositories\Eloquent\EloquentBranch;
use App\Repositories\Eloquent\EloquentBusiness;
use App\Repositories\Eloquent\EloquentDocument;
use App\Repositories\Eloquent\EloquentRequestType;
use App\Repositories\Eloquent\EloquentStorageLocation;
use App\Repositories\Eloquent\EloquentSystemStatus;
use App\Repositories\Eloquent\EloquentUser;
use App\Repositories\Interface\Branch as BranchRepositoryInterface;
use App\Repositories\Interface\Business as BusinessRepositoryInterface;
use App\Repositories\Interface\Document as DocumentRepositoryInterface;
use App\Repositories\Interface\RequestType as RequestTypeRepositoryInterface;
use App\Repositories\Interface\StorageLocation as StorageLocationRepositoryInterface;
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
        $this->app->bind(BranchRepositoryInterface::class, EloquentBranch::class);
        $this->app->bind(RequestTypeRepositoryInterface::class, EloquentRequestType::class);
        $this->app->bind(StorageLocationRepositoryInterface::class, EloquentStorageLocation::class);
        $this->app->bind(DocumentRepositoryInterface::class, EloquentDocument::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
