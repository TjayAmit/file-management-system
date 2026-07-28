<?php

use App\Http\Controllers\Api\V1\Admin\StorageLocationController as ApiAdminStorageLocationController;
use App\Http\Controllers\Api\V1\Admin\UserController as ApiAdminUserController;
use App\Http\Controllers\Api\V1\BranchController as ApiBranchController;
use App\Http\Controllers\Api\V1\BusinessController as ApiBusinessController;
use App\Http\Controllers\Api\V1\DocumentController as ApiDocumentController;
use App\Http\Controllers\Api\V1\RequestTypeController as ApiRequestTypeController;
use App\Http\Controllers\Api\V1\StorageLocationController as ApiStorageLocationController;
use App\Http\Controllers\Api\V1\SystemStatusController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/status', SystemStatusController::class)->name('api.v1.status');
    Route::get('/businesses', [ApiBusinessController::class, 'index'])->name('api.v1.businesses.index');
    Route::get('/branches', [ApiBranchController::class, 'index'])->name('api.v1.branches.index');
    Route::get('/request-types', [ApiRequestTypeController::class, 'index'])->name('api.v1.request-types.index');
    Route::get('/storage-locations', [ApiStorageLocationController::class, 'index'])->name('api.v1.storage-locations.index');
    Route::get('/documents', [ApiDocumentController::class, 'index'])->name('api.v1.documents.index');
    Route::get('/documents/{reference}', [ApiDocumentController::class, 'show'])->name('api.v1.documents.show');

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

        Route::post('/documents', [ApiDocumentController::class, 'store'])->name('api.v1.documents.store');
        Route::patch('/documents/{reference}', [ApiDocumentController::class, 'update'])->name('api.v1.documents.update');
        Route::post('/documents/{reference}/revert/{changeHistory}', [ApiDocumentController::class, 'revert'])->name('api.v1.documents.revert');
        Route::post('/documents/{reference}/replace-file', [ApiDocumentController::class, 'replaceFile'])->name('api.v1.documents.replace-file');
        Route::post('/documents/{reference}/revert-file/{version}', [ApiDocumentController::class, 'revertFileVersion'])->name('api.v1.documents.revert-file');
    });

    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->name('api.v1.admin.')->group(function (): void {
        Route::get('/users', [ApiAdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [ApiAdminUserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [ApiAdminUserController::class, 'update'])->name('users.update');
        Route::post('/users/{user}/deactivate', [ApiAdminUserController::class, 'deactivate'])->name('users.deactivate');
        Route::post('/users/{user}/reset-password', [ApiAdminUserController::class, 'resetPassword'])->name('users.reset-password');

        Route::post('/storage-locations', [ApiAdminStorageLocationController::class, 'store'])->name('storage-locations.store');
        Route::patch('/storage-locations/{storageLocation}', [ApiAdminStorageLocationController::class, 'update'])->name('storage-locations.update');
    });
});
