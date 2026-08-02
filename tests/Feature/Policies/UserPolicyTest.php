<?php

use App\Models\User;

test('only admins can administer accounts (PLAN.md §6.5)', function (string $role, bool $allowed) {
    $user = User::factory()->{$role}()->create();
    $target = User::factory()->create();

    expect($user->can('viewAny', User::class))->toBe($allowed);
    expect($user->can('create', User::class))->toBe($allowed);
    expect($user->can('update', $target))->toBe($allowed);
    expect($user->can('deactivate', $target))->toBe($allowed);
    expect($user->can('resetPassword', $target))->toBe($allowed);
})->with([
    ['viewer', false],
    ['editor', false],
    ['admin', true],
]);
