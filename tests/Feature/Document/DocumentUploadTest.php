<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

test('mandatory validation enforces all required fields and pdf file', function () {
    $editor = User::factory()->editor()->create();

    $response = $this->actingAs($editor)
        ->post(route('documents.store'), []);

    $response->assertSessionHasErrors([
        'branch_id',
        'request_type_id',
        'storage_location_id',
        'title',
        'document_date',
        'file',
    ]);
});

test('document encoding stores pdf on private disk, generates opaque reference, and creates current version 1', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $business = Business::factory()->create();
    $branch = Branch::factory()->create(['business_id' => $business->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $file = UploadedFile::fake()->create('contract.pdf', 100, 'application/pdf');

    $response = $this->actingAs($editor)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => $requestType->id,
            'storage_location_id' => $storage->id,
            'title' => 'Lease Agreement 2026',
            'document_date' => '2026-07-28',
            'approval_date' => '2026-07-28',
            'file' => $file,
        ]);

    $document = Document::where('title', 'Lease Agreement 2026')->first();
    expect($document)->not->toBeNull();

    $response->assertRedirect(route('documents.show', $document->reference));

    // Reference token is valid UUID
    expect(Str::isUuid($document->reference))->toBeTrue();

    // Document version 1 is created and marked current
    expect($document->versions)->toHaveCount(1);
    $version = $document->currentVersion;
    expect($version->is_current)->toBeTrue();
    expect($version->original_name)->toBe('contract.pdf');

    // File stored on private disk
    Storage::disk('private')->assertExists($version->path);

    // Activity logged
    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Document::class,
        'subject_id' => $document->id,
        'action' => 'document.created',
    ]);
});

test('viewer role is denied document upload', function () {
    $viewer = User::factory()->viewer()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $file = UploadedFile::fake()->create('test.pdf', 50, 'application/pdf');

    $response = $this->actingAs($viewer)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => $requestType->id,
            'storage_location_id' => $storage->id,
            'title' => 'Unauthorized Upload',
            'document_date' => '2026-07-28',
            'file' => $file,
        ]);

    $response->assertStatus(403);
});
