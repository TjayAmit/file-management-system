<?php

use App\Models\Activity;
use App\Models\Branch;
use App\Models\Business;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('creating and updating a business logs activity', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)
        ->post(route('businesses.store'), ['name' => 'New Corp'])
        ->assertRedirect();

    $business = Business::where('name', 'New Corp')->firstOrFail();

    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Business::class,
        'subject_id' => $business->id,
        'action' => 'business.created',
    ]);

    $this->actingAs($editor)
        ->patch(route('businesses.update', $business), ['name' => 'Renamed Corp'])
        ->assertRedirect();

    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Business::class,
        'subject_id' => $business->id,
        'action' => 'business.updated',
    ]);
});

test('creating and updating a branch logs activity', function () {
    $editor = User::factory()->editor()->create();
    $business = Business::factory()->create();

    $this->actingAs($editor)
        ->post(route('branches.store'), [
            'business_id' => $business->id,
            'location' => 'Main St',
        ])
        ->assertRedirect();

    $branch = Branch::where('location', 'Main St')->firstOrFail();

    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Branch::class,
        'subject_id' => $branch->id,
        'action' => 'branch.created',
    ]);

    $this->actingAs($editor)
        ->patch(route('branches.update', $branch), ['location' => 'Second St'])
        ->assertRedirect();

    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Branch::class,
        'subject_id' => $branch->id,
        'action' => 'branch.updated',
    ]);
});

test('creating and updating a request type logs activity', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)
        ->post(route('request-types.store'), ['name' => 'Certification'])
        ->assertRedirect();

    $requestType = RequestType::where('name', 'Certification')->firstOrFail();

    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => RequestType::class,
        'subject_id' => $requestType->id,
        'action' => 'request_type.created',
    ]);

    $this->actingAs($editor)
        ->patch(route('request-types.update', $requestType), ['name' => 'Certified Copy'])
        ->assertRedirect();

    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => RequestType::class,
        'subject_id' => $requestType->id,
        'action' => 'request_type.updated',
    ]);
});

test('creating and updating a storage location logs activity', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.storage-locations.store'), ['name' => 'Shelf A'])
        ->assertRedirect();

    $storageLocation = StorageLocation::where('name', 'Shelf A')->firstOrFail();

    $this->assertDatabaseHas('activities', [
        'user_id' => $admin->id,
        'subject_type' => StorageLocation::class,
        'subject_id' => $storageLocation->id,
        'action' => 'storage_location.created',
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.storage-locations.update', $storageLocation), ['name' => 'Shelf B'])
        ->assertRedirect();

    $this->assertDatabaseHas('activities', [
        'user_id' => $admin->id,
        'subject_type' => StorageLocation::class,
        'subject_id' => $storageLocation->id,
        'action' => 'storage_location.updated',
    ]);
});

test('creating, updating, deactivating, and resetting a user logs activity attributed to the admin', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'New Staff',
            'email' => 'staff@example.com',
            'password' => 'SecurePass123!',
            'role' => 'editor',
        ])
        ->assertRedirect();

    $targetUser = User::where('email', 'staff@example.com')->firstOrFail();

    $this->assertDatabaseHas('activities', [
        'user_id' => $admin->id,
        'subject_type' => User::class,
        'subject_id' => $targetUser->id,
        'action' => 'user.created',
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.users.update', $targetUser), ['role' => 'viewer'])
        ->assertRedirect();

    $this->assertDatabaseHas('activities', [
        'user_id' => $admin->id,
        'subject_type' => User::class,
        'subject_id' => $targetUser->id,
        'action' => 'user.updated',
    ]);

    $updateActivity = Activity::where('action', 'user.updated')->where('subject_id', $targetUser->id)->firstOrFail();
    expect($updateActivity->details)->not->toHaveKey('password');

    $this->actingAs($admin)
        ->post(route('admin.users.deactivate', $targetUser))
        ->assertRedirect();

    $this->assertDatabaseHas('activities', [
        'user_id' => $admin->id,
        'subject_type' => User::class,
        'subject_id' => $targetUser->id,
        'action' => 'user.deactivated',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.users.reset-password', $targetUser), ['password' => 'AnotherPass123!'])
        ->assertRedirect();

    $this->assertDatabaseHas('activities', [
        'user_id' => $admin->id,
        'subject_type' => User::class,
        'subject_id' => $targetUser->id,
        'action' => 'user.password_reset',
    ]);
    expect(Hash::check('AnotherPass123!', $targetUser->fresh()->password))->toBeTrue();
});

test('activity log is read-only, append-only, and viewable by admin only', function () {
    $admin = User::factory()->admin()->create();
    $editor = User::factory()->editor()->create();
    $viewer = User::factory()->viewer()->create();

    $activity = Activity::factory()->create([
        'user_id' => $editor->id,
        'action' => 'business.created',
    ]);

    $this->actingAs($viewer)
        ->get(route('admin.activities.index'))
        ->assertStatus(403);

    $this->actingAs($editor)
        ->get(route('admin.activities.index'))
        ->assertStatus(403);

    $this->actingAs($admin)
        ->get(route('admin.activities.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('admin/activities/index')
            ->has('activities.data', 1)
        );

    expect($activity->timestamps)->toBeFalse();
});
