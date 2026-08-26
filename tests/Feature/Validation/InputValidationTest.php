<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('vocabulary names reject markup and control characters', function (string $route, string $field) {
    $editor = User::factory()->editor()->create();

    $payload = [$field => '<script>alert(1)</script>'];

    if ($route === 'branches.store') {
        $payload['business_id'] = Business::factory()->create()->id;
    }

    $this->actingAs($editor)
        ->post(route($route), $payload)
        ->assertSessionHasErrors($field);
})->with([
    ['businesses.store', 'name'],
    ['branches.store', 'location'],
    ['request-types.store', 'name'],
]);

test('vocabulary names are trimmed and internal whitespace collapsed', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)
        ->post(route('businesses.store'), ['name' => "  ABC   Corporation \n"])
        ->assertRedirect();

    $this->assertDatabaseHas('businesses', ['name' => 'ABC Corporation']);
});

test('a business name that is too short is rejected', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)
        ->post(route('businesses.store'), ['name' => 'A'])
        ->assertSessionHasErrors('name');
});

test('a genuinely new business with an existing-looking name is still allowed', function () {
    $editor = User::factory()->editor()->create();
    Business::factory()->create(['name' => 'ABC Corp']);

    $this->actingAs($editor)
        ->post(route('businesses.store'), ['name' => 'ABC Corp'])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(Business::where('name', 'ABC Corp')->count())->toBe(2);
});

test('a document dated in the future is rejected', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);

    $this->actingAs($editor)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => RequestType::factory()->create()->id,
            'storage_location_id' => StorageLocation::factory()->create()->id,
            'title' => 'Tomorrow permit',
            'document_date' => now()->addDay()->toDateString(),
            'file' => UploadedFile::fake()->create('scan.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasErrors('document_date');
});

test('an approval date earlier than the request date is rejected', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);

    $this->actingAs($editor)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => RequestType::factory()->create()->id,
            'storage_location_id' => StorageLocation::factory()->create()->id,
            'title' => 'Out of order permit',
            'document_date' => '2026-01-10',
            'request_date' => '2026-01-10',
            'approval_date' => '2026-01-01',
            'file' => UploadedFile::fake()->create('scan.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasErrors('approval_date');
});

test('a non-pdf upload is rejected even when it is named like a pdf', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);

    $this->actingAs($editor)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => RequestType::factory()->create()->id,
            'storage_location_id' => StorageLocation::factory()->create()->id,
            'title' => 'Disguised executable',
            'document_date' => '2026-01-10',
            'file' => UploadedFile::fake()->create('scan.pdf', 100, 'application/x-msdownload'),
        ])
        ->assertSessionHasErrors('file');
});

test('a deletion request needs a reason an admin can act on', function () {
    $editor = User::factory()->editor()->create();
    $document = Document::factory()->create();

    $this->actingAs($editor)
        ->post(route('documents.deletion-requests.store', $document->reference), ['reason' => 'no'])
        ->assertSessionHasErrors('reason');
});

test('a transfer batch rejects duplicate and unknown references', function () {
    $editor = User::factory()->editor()->create();
    $document = Document::factory()->create();
    $target = StorageLocation::factory()->create();

    $this->actingAs($editor)
        ->post(route('transfers.store'), [
            'references' => [$document->reference, $document->reference],
            'to_storage_location_id' => $target->id,
        ])
        ->assertSessionHasErrors('references.1');

    $this->actingAs($editor)
        ->post(route('transfers.store'), [
            'references' => ['00000000-0000-0000-0000-000000000000'],
            'to_storage_location_id' => $target->id,
        ])
        ->assertSessionHasErrors('references.0');
});

test('an admin-set password must meet the strength floor', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'New Clerk',
            'email' => 'clerk@example.test',
            'password' => 'short',
            'role' => 'viewer',
        ])
        ->assertSessionHasErrors('password');
});

test('a user email is normalized to lowercase before it is stored', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'New Clerk',
            'email' => '  Clerk@Example.Test ',
            'password' => 'StrongTempPass123!',
            'role' => 'viewer',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', ['email' => 'clerk@example.test']);
});

test('an unknown role cannot be assigned', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'New Clerk',
            'email' => 'clerk2@example.test',
            'password' => 'StrongTempPass123!',
            'role' => 'superadmin',
        ])
        ->assertSessionHasErrors('role');
});
