<?php

use App\Models\RequestType;
use App\Models\User;

test('any authenticated role can view request types', function (string $role) {
    $user = User::factory()->{$role}()->create();

    expect($user->can('viewAny', RequestType::class))->toBeTrue();
    expect($user->can('view', RequestType::factory()->create()))->toBeTrue();
})->with(['viewer', 'editor', 'admin']);

test('only editors and admins can create, update, and merge request types', function (string $role, bool $allowed) {
    $user = User::factory()->{$role}()->create();
    $requestType = RequestType::factory()->create();

    expect($user->can('create', RequestType::class))->toBe($allowed);
    expect($user->can('update', $requestType))->toBe($allowed);
    expect($user->can('merge', RequestType::class))->toBe($allowed);
})->with([
    ['viewer', false],
    ['editor', true],
    ['admin', true],
]);
