<?php

use App\Models\Business;
use App\Models\User;

test('any authenticated role can view businesses', function (string $role) {
    $user = User::factory()->{$role}()->create();

    expect($user->can('viewAny', Business::class))->toBeTrue();
    expect($user->can('view', Business::factory()->create()))->toBeTrue();
})->with(['viewer', 'editor', 'admin']);

test('only editors and admins can create, update, and merge businesses', function (string $role, bool $allowed) {
    $user = User::factory()->{$role}()->create();
    $business = Business::factory()->create();

    expect($user->can('create', Business::class))->toBe($allowed);
    expect($user->can('update', $business))->toBe($allowed);
    expect($user->can('merge', Business::class))->toBe($allowed);
})->with([
    ['viewer', false],
    ['editor', true],
    ['admin', true],
]);
