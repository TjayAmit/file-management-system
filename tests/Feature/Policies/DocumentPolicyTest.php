<?php

use App\Models\Document;
use App\Models\User;

test('any authenticated role can view documents (PLAN.md §3.5)', function (string $role) {
    $user = User::factory()->{$role}()->create();

    expect($user->can('viewAny', Document::class))->toBeTrue();
    expect($user->can('view', Document::factory()->create()))->toBeTrue();
})->with(['viewer', 'editor', 'admin']);

test('only editors and admins can create and edit documents', function (string $role, bool $allowed) {
    $user = User::factory()->{$role}()->create();
    $document = Document::factory()->create();

    expect($user->can('create', Document::class))->toBe($allowed);
    expect($user->can('update', $document))->toBe($allowed);
    expect($user->can('updateLocation', $document))->toBe($allowed);
    expect($user->can('revert', $document))->toBe($allowed);
    expect($user->can('replaceFile', $document))->toBe($allowed);
    expect($user->can('revertFileVersion', $document))->toBe($allowed);
    expect($user->can('requestDeletion', $document))->toBe($allowed);
})->with([
    ['viewer', false],
    ['editor', true],
    ['admin', true],
]);
