<?php

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Support\Facades\Hash;

test('it seeds an account for every role the User model declares', function () {
    $this->seed(UserSeeder::class);

    // Sourced from the model rather than a literal, so a role added to
    // User::ROLES without a seeded account fails here instead of going
    // unnoticed until someone cannot log in.
    expect(User::count())->toBe(count(User::ROLES));

    foreach (User::ROLES as $role) {
        expect(User::where('role', $role)->count())->toBe(1);
    }
});

test('the named accounts carry the expected role, state, and password', function () {
    $this->seed(UserSeeder::class);

    foreach ([
        'admin@boss.com' => 'admin',
        'editor@boss.com' => 'editor',
        'viewer@boss.com' => 'viewer',
    ] as $email => $role) {
        $user = User::where('email', $email)->firstOrFail();

        expect($user->role)->toBe($role)
            ->and($user->is_active)->toBeTrue()
            ->and(Hash::check('password', $user->password))->toBeTrue();
    }
});

test('seeded accounts are verified, so they are not locked out of the archive', function () {
    $this->seed(UserSeeder::class);

    $admin = User::where('email', 'admin@boss.com')->firstOrFail();

    expect($admin->email_verified_at)->not->toBeNull();

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk();
});

test('the seeded admin can reach every administrative page', function () {
    $this->seed(UserSeeder::class);

    $admin = User::where('email', 'admin@boss.com')->firstOrFail();

    foreach ([
        'documents.create',
        'admin.users.index',
        'admin.activities.index',
        'admin.access-logs.index',
        'search.report',
        'deletion-requests.index',
        'storage-locations.index',
    ] as $name) {
        $this->actingAs($admin)->get(route($name))->assertOk();
    }
});

test('the seeded editor can encode but cannot administer', function () {
    $this->seed(UserSeeder::class);

    $editor = User::where('email', 'editor@boss.com')->firstOrFail();

    $this->actingAs($editor)->get(route('documents.create'))->assertOk();
    $this->actingAs($editor)->get(route('admin.users.index'))->assertStatus(403);
});

test('the seeded viewer can search but cannot encode', function () {
    $this->seed(UserSeeder::class);

    $viewer = User::where('email', 'viewer@boss.com')->firstOrFail();

    $this->actingAs($viewer)->get(route('search.index'))->assertOk();
    $this->actingAs($viewer)->get(route('documents.create'))->assertStatus(403);
});

test('re-seeding neither duplicates an account nor resets a changed password', function () {
    $this->seed(UserSeeder::class);

    $admin = User::where('email', 'admin@boss.com')->firstOrFail();
    $admin->forceFill(['password' => Hash::make('ChangedOnFirstLogin1!')])->save();

    $this->seed(UserSeeder::class);

    expect(User::count())->toBe(count(User::ROLES))
        ->and(Hash::check('ChangedOnFirstLogin1!', $admin->fresh()->password))->toBeTrue();
});
