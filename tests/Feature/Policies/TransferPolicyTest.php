<?php

use App\Models\Transfer;
use App\Models\User;

test('only editors and admins can create transfers', function (string $role, bool $allowed) {
    $user = User::factory()->{$role}()->create();

    expect($user->can('create', Transfer::class))->toBe($allowed);
})->with([
    ['viewer', false],
    ['editor', true],
    ['admin', true],
]);
