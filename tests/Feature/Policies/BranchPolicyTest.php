<?php

use App\Models\Branch;
use App\Models\User;

test('any authenticated role can view branches', function (string $role) {
    $user = User::factory()->{$role}()->create();

    expect($user->can('viewAny', Branch::class))->toBeTrue();
    expect($user->can('view', Branch::factory()->create()))->toBeTrue();
})->with(['viewer', 'editor', 'admin']);

test('only editors and admins can create, update, reparent, and merge branches', function (string $role, bool $allowed) {
    $user = User::factory()->{$role}()->create();
    $branch = Branch::factory()->create();

    expect($user->can('create', Branch::class))->toBe($allowed);
    expect($user->can('update', $branch))->toBe($allowed);
    expect($user->can('reparent', $branch))->toBe($allowed);
    expect($user->can('merge', Branch::class))->toBe($allowed);
})->with([
    ['viewer', false],
    ['editor', true],
    ['admin', true],
]);
