<?php

use App\Http\Controllers\Admin\UserController as WebAdminUserController;
use App\Http\Controllers\SystemStatusController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('/system-status', SystemStatusController::class)->name('system-status');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/users', [WebAdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [WebAdminUserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [WebAdminUserController::class, 'update'])->name('users.update');
        Route::post('/users/{user}/deactivate', [WebAdminUserController::class, 'deactivate'])->name('users.deactivate');
        Route::post('/users/{user}/reset-password', [WebAdminUserController::class, 'resetPassword'])->name('users.reset-password');
    });
});

require __DIR__.'/settings.php';
