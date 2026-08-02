<?php

use App\Models\StorageLocation;
use App\Models\User;

test('any authenticated role can view storage locations', function (string $role) {
    $user = User::factory()->{$role}()->create();

    expect($user->can('viewAny', StorageLocation::class))->toBeTrue();
    expect($user->can('view', StorageLocation::factory()->create()))->toBeTrue();
})->with(['viewer', 'editor', 'admin']);

test('only admins can create and update storage locations', function (string $role, bool $allowed) {
    $user = User::factory()->{$role}()->create();
    $storageLocation = StorageLocation::factory()->create();

    expect($user->can('create', StorageLocation::class))->toBe($allowed);
    expect($user->can('update', $storageLocation))->toBe($allowed);
})->with([
    ['viewer', false],
    ['editor', false],
    ['admin', true],
]);
