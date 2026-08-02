<?php

use App\Models\User;
use Illuminate\Support\Facades\Gate;

test('only admins can view the search hit-rate report (PLAN.md §5.3)', function (string $role, bool $allowed) {
    $user = User::factory()->{$role}()->create();

    expect(Gate::forUser($user)->allows('view-search-report'))->toBe($allowed);
})->with([
    ['viewer', false],
    ['editor', false],
    ['admin', true],
]);
