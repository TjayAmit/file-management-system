<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('replacing file scan retains superseded version bytes on private disk and updates current version', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    // 1. Initial upload
    $initialFile = UploadedFile::fake()->create('v1.pdf', 100, 'application/pdf');
    $this->actingAs($editor)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => $requestType->id,
            'storage_location_id' => $storage->id,
            'title' => 'Doc Title',
            'document_date' => '2026-07-28',
            'file' => $initialFile,
        ]);

    $document = Document::where('title', 'Doc Title')->first();
    $v1 = $document->currentVersion;
    expect($v1->is_current)->toBeTrue();

    // 2. Replace file scan
    $v2File = UploadedFile::fake()->create('v2.pdf', 200, 'application/pdf');
    $response = $this->actingAs($editor)
        ->post(route('documents.replace-file', $document->reference), [
            'file' => $v2File,
        ]);

    $response->assertRedirect();

    $document->refresh();
    expect($document->versions)->toHaveCount(2);

    $v1Fresh = $v1->fresh();
    expect($v1Fresh->is_current)->toBeFalse();

    $v2Current = $document->currentVersion;
    expect($v2Current->is_current)->toBeTrue();
    expect($v2Current->original_name)->toBe('v2.pdf');

    // Both files exist on private storage disk
    Storage::disk('private')->assertExists($v1Fresh->path);
    Storage::disk('private')->assertExists($v2Current->path);

    // Activity logged
    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Document::class,
        'subject_id' => $document->id,
        'action' => 'document.file_replaced',
    ]);
});

test('reverting to a previous file version updates current version flag', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    // Upload v1
    $v1File = UploadedFile::fake()->create('v1.pdf', 100, 'application/pdf');
    $this->actingAs($editor)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => $requestType->id,
            'storage_location_id' => $storage->id,
            'title' => 'Doc Title',
            'document_date' => '2026-07-28',
            'file' => $v1File,
        ]);

    $document = Document::where('title', 'Doc Title')->first();
    $v1 = $document->currentVersion;

    // Upload v2
    $v2File = UploadedFile::fake()->create('v2.pdf', 200, 'application/pdf');
    $this->actingAs($editor)
        ->post(route('documents.replace-file', $document->reference), [
            'file' => $v2File,
        ]);

    $v2 = $document->fresh()->currentVersion;

    // Revert back to v1
    $response = $this->actingAs($editor)
        ->post(route('documents.revert-file', ['reference' => $document->reference, 'version' => $v1->id]));

    $response->assertRedirect();

    expect($v1->fresh()->is_current)->toBeTrue();
    expect($v2->fresh()->is_current)->toBeFalse();

    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Document::class,
        'subject_id' => $document->id,
        'action' => 'document.file_version_reverted',
    ]);
});

test('viewer role is denied file replacement and revert', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $viewer = User::factory()->viewer()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    // Upload v1 as editor
    $v1File = UploadedFile::fake()->create('v1.pdf', 100, 'application/pdf');
    $this->actingAs($editor)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => $requestType->id,
            'storage_location_id' => $storage->id,
            'title' => 'Doc Title',
            'document_date' => '2026-07-28',
            'file' => $v1File,
        ]);

    $document = Document::where('title', 'Doc Title')->first();
    $v1 = $document->currentVersion;

    // Viewer attempts replacement
    $v2File = UploadedFile::fake()->create('v2.pdf', 200, 'application/pdf');
    $response = $this->actingAs($viewer)
        ->post(route('documents.replace-file', $document->reference), [
            'file' => $v2File,
        ]);

    $response->assertStatus(403);

    // Viewer attempts revert
    $revertResponse = $this->actingAs($viewer)
        ->post(route('documents.revert-file', ['reference' => $document->reference, 'version' => $v1->id]));

    $revertResponse->assertStatus(403);
});
