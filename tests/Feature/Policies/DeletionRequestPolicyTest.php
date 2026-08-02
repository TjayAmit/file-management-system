<?php

use App\Models\DeletionRequest;
use App\Models\User;

test('only admins can approve and reject deletion requests', function (string $role, bool $allowed) {
    $user = User::factory()->{$role}()->create();
    $deletionRequest = DeletionRequest::factory()->create();

    expect($user->can('approve', $deletionRequest))->toBe($allowed);
    expect($user->can('reject', $deletionRequest))->toBe($allowed);
})->with([
    ['viewer', false],
    ['editor', false],
    ['admin', true],
]);
