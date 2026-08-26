<?php

use App\Models\Business;
use App\Models\Document;
use App\Models\StorageLocation;
use App\Models\User;

test('a field the form does not declare is rejected, not silently ignored', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)
        ->post(route('businesses.store'), [
            'name' => 'Legitimate Corp',
            'id' => 9999,
        ])
        ->assertSessionHasErrors('id');

    $this->assertDatabaseMissing('businesses', ['name' => 'Legitimate Corp']);
});

test('an attempt to smuggle a privileged field into a document upload is rejected', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)
        ->post(route('documents.store'), [
            'is_hidden' => true,
            'uploaded_by' => 1,
        ])
        ->assertSessionHasErrors(['is_hidden', 'uploaded_by']);
});

test('a user cannot promote themselves by adding a role field to their profile', function () {
    $viewer = User::factory()->viewer()->create();

    $this->actingAs($viewer)
        ->patch(route('profile.update'), [
            'name' => 'Front Desk',
            'email' => 'front.desk@office.test',
            'role' => 'admin',
        ])
        ->assertSessionHasErrors('role');

    expect($viewer->fresh()->role)->toBe('viewer');
});

test('the confirmation partner of a confirmed rule is still accepted', function () {
    $user = User::factory()->create(['password' => Hash::make('OriginalPass123!')]);

    $this->actingAs($user)
        ->put(route('password.update'), [
            'current_password' => 'OriginalPass123!',
            'password' => 'BrandNewPass456!',
            'password_confirmation' => 'BrandNewPass456!',
        ])
        ->assertSessionHasNoErrors();
});

test('a malformed document reference is a 404 at the router, never a query', function () {
    $viewer = User::factory()->viewer()->create();

    foreach (['not-a-uuid', '1', '../../etc/passwd', "1' OR '1'='1"] as $reference) {
        $this->actingAs($viewer)
            ->get('/documents/'.rawurlencode($reference))
            ->assertNotFound();
    }
});

test('a well-formed but unknown reference still reaches the controller 404', function () {
    $this->actingAs(User::factory()->viewer()->create())
        ->get(route('documents.show', '00000000-0000-0000-0000-000000000000'))
        ->assertNotFound();
});

test('a non-numeric model id is a 404 at the router', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->patch('/businesses/abc', ['name' => 'Whatever Corp'])
        ->assertNotFound();
});

test('a staff name may not carry markup', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => '<img src=x onerror=alert(1)>',
            'email' => 'probe@office.test',
            'password' => 'StrongTempPass123!',
            'role' => 'viewer',
        ])
        ->assertSessionHasErrors('name');
});

test('an oversized free-text field is rejected', function () {
    $editor = User::factory()->editor()->create();
    $document = Document::factory()->create();

    $this->actingAs($editor)
        ->post(route('documents.deletion-requests.store', $document->reference), [
            'reason' => str_repeat('a', 1001),
        ])
        ->assertSessionHasErrors('reason');
});

test('a transfer batch larger than the cap is rejected', function () {
    $editor = User::factory()->editor()->create();
    $target = StorageLocation::factory()->create();

    $references = array_fill(0, 501, '00000000-0000-0000-0000-000000000000');

    $this->actingAs($editor)
        ->post(route('transfers.store'), [
            'references' => $references,
            'to_storage_location_id' => $target->id,
        ])
        ->assertSessionHasErrors('references');
});

test('a bulk seed larger than the cap is rejected', function () {
    $editor = User::factory()->editor()->create();

    $rows = array_fill(0, 1001, ['name' => 'Some Business']);

    $this->actingAs($editor)
        ->post(route('businesses.bulk-seed'), ['rows' => $rows])
        ->assertSessionHasErrors('rows');

    expect(Business::count())->toBe(0);
});
