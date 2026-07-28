<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

test('public self registration is disabled', function () {
    $response = $this->get('/register');
    $response->assertStatus(404);

    $postResponse = $this->post('/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);
    $postResponse->assertStatus(404);
});

test('role gating allows admin and denies viewer and editor', function () {
    $admin = User::factory()->admin()->create();
    $editor = User::factory()->editor()->create();
    $viewer = User::factory()->viewer()->create();

    // Viewer denied
    $this->actingAs($viewer)
        ->get(route('admin.users.index'))
        ->assertStatus(403);

    // Editor denied
    $this->actingAs($editor)
        ->get(route('admin.users.index'))
        ->assertStatus(403);

    // Admin allowed
    $this->actingAs($admin)
        ->get(route('admin.users.index'))
        ->assertStatus(200);
});

test('deactivated user is logged out on next request', function () {
    $user = User::factory()->editor()->create(['is_active' => true]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertStatus(200);

    // Deactivate user
    $user->update(['is_active' => false]);

    // Next request logs user out
    $response = $this->actingAs($user)
        ->get(route('dashboard'));

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});

test('admin can create a new user with role', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'New Staff',
            'email' => 'staff@example.com',
            'password' => 'SecurePass123!',
            'role' => 'editor',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'name' => 'New Staff',
        'email' => 'staff@example.com',
        'role' => 'editor',
        'is_active' => true,
    ]);

    $createdUser = User::where('email', 'staff@example.com')->first();
    expect($createdUser->isEditor())->toBeTrue();
});

test('admin can update user role and deactivate user', function () {
    $admin = User::factory()->admin()->create();
    $targetUser = User::factory()->viewer()->create();

    // Promote viewer to editor
    $this->actingAs($admin)
        ->patch(route('admin.users.update', $targetUser), [
            'role' => 'editor',
        ])
        ->assertRedirect();

    expect($targetUser->fresh()->isEditor())->toBeTrue();

    // Deactivate user
    $this->actingAs($admin)
        ->post(route('admin.users.deactivate', $targetUser))
        ->assertRedirect();

    expect($targetUser->fresh()->is_active)->toBeFalse();
});

test('admin can set temporary password for offline reset', function () {
    $admin = User::factory()->admin()->create();
    $targetUser = User::factory()->editor()->create([
        'password' => Hash::make('oldpassword'),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.users.reset-password', $targetUser), [
            'password' => 'NewTempPassword123!',
        ])
        ->assertRedirect();

    expect(Hash::check('NewTempPassword123!', $targetUser->fresh()->password))->toBeTrue();
});

test('spatie permission role assignment works with user model', function () {
    Role::findOrCreate('admin');
    Role::findOrCreate('editor');

    $user = User::factory()->create(['role' => 'editor']);
    $user->assignRole('editor');

    expect($user->hasRole('editor'))->toBeTrue();
    expect($user->isEditor())->toBeTrue();
});
