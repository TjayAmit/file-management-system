<?php

use App\Http\Controllers\Api\V1\Admin\UserController as ApiAdminUserController;
use App\Http\Controllers\Api\V1\BranchController as ApiBranchController;
use App\Http\Controllers\Api\V1\BusinessController as ApiBusinessController;
use App\Http\Controllers\Api\V1\RequestTypeController as ApiRequestTypeController;
use App\Http\Controllers\Api\V1\SystemStatusController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/status', SystemStatusController::class)->name('api.v1.status');
    Route::get('/businesses', [ApiBusinessController::class, 'index'])->name('api.v1.businesses.index');
    Route::get('/branches', [ApiBranchController::class, 'index'])->name('api.v1.branches.index');
    Route::get('/request-types', [ApiRequestTypeController::class, 'index'])->name('api.v1.request-types.index');

    Route::middleware(['auth:sanctum', 'role:editor,admin'])->group(function (): void {
        Route::post('/businesses', [ApiBusinessController::class, 'store'])->name('api.v1.businesses.store');
        Route::patch('/businesses/{business}', [ApiBusinessController::class, 'update'])->name('api.v1.businesses.update');
        Route::post('/businesses/merge', [ApiBusinessController::class, 'merge'])->name('api.v1.businesses.merge');

        Route::post('/branches', [ApiBranchController::class, 'store'])->name('api.v1.branches.store');
        Route::patch('/branches/{branch}', [ApiBranchController::class, 'update'])->name('api.v1.branches.update');
        Route::post('/branches/{branch}/reparent', [ApiBranchController::class, 'reparent'])->name('api.v1.branches.reparent');
        Route::post('/branches/merge', [ApiBranchController::class, 'merge'])->name('api.v1.branches.merge');

        Route::post('/request-types', [ApiRequestTypeController::class, 'store'])->name('api.v1.request-types.store');
        Route::patch('/request-types/{requestType}', [ApiRequestTypeController::class, 'update'])->name('api.v1.request-types.update');
        Route::post('/request-types/merge', [ApiRequestTypeController::class, 'merge'])->name('api.v1.request-types.merge');
    });

    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->name('api.v1.admin.')->group(function (): void {
        Route::get('/users', [ApiAdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [ApiAdminUserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [ApiAdminUserController::class, 'update'])->name('users.update');
        Route::post('/users/{user}/deactivate', [ApiAdminUserController::class, 'deactivate'])->name('users.deactivate');
        Route::post('/users/{user}/reset-password', [ApiAdminUserController::class, 'resetPassword'])->name('users.reset-password');
    });
});
