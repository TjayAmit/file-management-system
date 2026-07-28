<?php

use App\Http\Controllers\Api\V1\Admin\UserController as ApiAdminUserController;
use App\Http\Controllers\Api\V1\SystemStatusController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/status', SystemStatusController::class)->name('api.v1.status');

    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->name('api.v1.admin.')->group(function (): void {
        Route::get('/users', [ApiAdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [ApiAdminUserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [ApiAdminUserController::class, 'update'])->name('users.update');
        Route::post('/users/{user}/deactivate', [ApiAdminUserController::class, 'deactivate'])->name('users.deactivate');
        Route::post('/users/{user}/reset-password', [ApiAdminUserController::class, 'resetPassword'])->name('users.reset-password');
    });
});
