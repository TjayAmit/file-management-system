<?php

use App\Http\Controllers\Admin\StorageLocationController as WebAdminStorageLocationController;
use App\Http\Controllers\Admin\UserController as WebAdminUserController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\DeletionRequestController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\RequestTypeController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\StorageLocationController;
use App\Http\Controllers\SystemStatusController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::get('/system-status', SystemStatusController::class)->name('system-status');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('/businesses', [BusinessController::class, 'index'])->name('businesses.index');
    Route::get('/branches', [BranchController::class, 'index'])->name('branches.index');
    Route::get('/request-types', [RequestTypeController::class, 'index'])->name('request-types.index');
    Route::get('/storage-locations', [StorageLocationController::class, 'index'])->name('storage-locations.index');
    Route::get('/search', [SearchController::class, 'index'])->name('search.index');

    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('/documents/create', [DocumentController::class, 'create'])->middleware('role:editor,admin')->name('documents.create');
    Route::get('/documents/{reference}', [DocumentController::class, 'show'])->name('documents.show');
    Route::get('/documents/{reference}/file', [DocumentController::class, 'serveFile'])->name('documents.file');

    Route::middleware(['role:editor,admin'])->group(function () {
        Route::post('/businesses', [BusinessController::class, 'store'])->name('businesses.store');
        Route::patch('/businesses/{business}', [BusinessController::class, 'update'])->name('businesses.update');
        Route::post('/businesses/merge', [BusinessController::class, 'merge'])->name('businesses.merge');

        Route::post('/branches', [BranchController::class, 'store'])->name('branches.store');
        Route::patch('/branches/{branch}', [BranchController::class, 'update'])->name('branches.update');
        Route::post('/branches/{branch}/reparent', [BranchController::class, 'reparent'])->name('branches.reparent');
        Route::post('/branches/merge', [BranchController::class, 'merge'])->name('branches.merge');

        Route::post('/request-types', [RequestTypeController::class, 'store'])->name('request-types.store');
        Route::patch('/request-types/{requestType}', [RequestTypeController::class, 'update'])->name('request-types.update');
        Route::post('/request-types/merge', [RequestTypeController::class, 'merge'])->name('request-types.merge');

        Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
        Route::patch('/documents/{reference}', [DocumentController::class, 'update'])->name('documents.update');
        Route::post('/documents/{reference}/revert/{changeHistory}', [DocumentController::class, 'revert'])->name('documents.revert');
        Route::post('/documents/{reference}/replace-file', [DocumentController::class, 'replaceFile'])->name('documents.replace-file');
        Route::post('/documents/{reference}/revert-file/{version}', [DocumentController::class, 'revertFileVersion'])->name('documents.revert-file');
        Route::post('/documents/{reference}/deletion-requests', [DocumentController::class, 'requestDeletion'])->name('documents.deletion-requests.store');
    });

    Route::middleware(['role:admin'])->group(function () {
        Route::get('/search/report', [SearchController::class, 'report'])->name('search.report');

        Route::post('/deletion-requests/{deletionRequest}/approve', [DeletionRequestController::class, 'approve'])->name('deletion-requests.approve');
        Route::post('/deletion-requests/{deletionRequest}/reject', [DeletionRequestController::class, 'reject'])->name('deletion-requests.reject');
    });

    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/users', [WebAdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [WebAdminUserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [WebAdminUserController::class, 'update'])->name('users.update');
        Route::post('/users/{user}/deactivate', [WebAdminUserController::class, 'deactivate'])->name('users.deactivate');
        Route::post('/users/{user}/reset-password', [WebAdminUserController::class, 'resetPassword'])->name('users.reset-password');

        Route::post('/storage-locations', [WebAdminStorageLocationController::class, 'store'])->name('storage-locations.store');
        Route::patch('/storage-locations/{storageLocation}', [WebAdminStorageLocationController::class, 'update'])->name('storage-locations.update');
    });
});

require __DIR__.'/settings.php';
