<?php

use App\Models\Activity;
use App\Models\User;

test('only admins can view the activity log', function (string $role, bool $allowed) {
    $user = User::factory()->{$role}()->create();

    expect($user->can('viewAny', Activity::class))->toBe($allowed);
})->with([
    ['viewer', false],
    ['editor', false],
    ['admin', true],
]);
