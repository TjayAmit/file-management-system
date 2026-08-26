<?php

namespace App\Providers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureGates();
        $this->configureRoutePatterns();
        $this->configureRateLimiters();
    }

    /**
     * The search hit-rate report (PLAN.md §5.3) has no dedicated Eloquent
     * model to hang a policy on, so it's authorized via a plain Gate.
     */
    protected function configureGates(): void
    {
        Gate::define('view-search-report', fn (User $user): bool => $user->isAdmin());
    }

    /**
     * Constrain route parameters so a malformed identifier is a 404 at the
     * router, before it reaches a controller, a policy, or a query.
     *
     * The document reference is the only public handle on a document and is
     * always a UUID (PLAN.md section 6.9); every other parameter is a
     * database id.
     */
    protected function configureRoutePatterns(): void
    {
        Route::pattern('reference', '[0-9a-fA-F-]{36}');

        foreach (['business', 'branch', 'requestType', 'storageLocation', 'user', 'deletionRequest', 'changeHistory', 'version'] as $parameter) {
            Route::pattern($parameter, '[0-9]+');
        }
    }

    /**
     * Named rate limiters for the archive's own endpoints.
     *
     * The office network is trusted but not unlimited: a stuck script or a
     * compromised workstation should not be able to hammer uploads or drain
     * the archive through the serving route. Limits are set well above what
     * a person types and well below what a loop achieves.
     */
    protected function configureRateLimiters(): void
    {
        RateLimiter::for('archive-writes', fn (Request $request): Limit => Limit::perMinute(60)
            ->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('document-serving', fn (Request $request): Limit => Limit::perMinute(120)
            ->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('uploads', fn (Request $request): Limit => Limit::perMinute(20)
            ->by($request->user()?->id ?: $request->ip()));
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
