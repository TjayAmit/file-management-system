<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;

test('resolving a document by reference returns its identity and current location', function () {
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storageLocation = StorageLocation::factory()->create();

    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $storageLocation->id,
    ]);

    $response = $this->getJson("/api/v1/documents/{$document->reference}");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'reference' => $document->reference,
                'storage_location_id' => $storageLocation->id,
            ],
        ]);
});

test('resolving an unknown reference returns not found', function () {
    $response = $this->getJson('/api/v1/documents/does-not-exist');

    $response->assertStatus(404)
        ->assertJson(['success' => false]);
});

test('editor can update a document location via the api', function () {
    $editor = User::factory()->editor()->create();

    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $office = StorageLocation::factory()->create(['name' => 'In Office']);
    $centralStorage = StorageLocation::factory()->create(['name' => 'Central Storage Building']);

    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $office->id,
    ]);

    $response = $this->actingAs($editor, 'sanctum')->patchJson("/api/v1/documents/{$document->reference}/location", [
        'to_storage_location_id' => $centralStorage->id,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => ['storage_location_id' => $centralStorage->id],
        ]);

    expect($document->fresh()->storage_location_id)->toBe($centralStorage->id);

    $this->assertDatabaseHas('transfer_items', [
        'document_id' => $document->id,
        'from_storage_location_id' => $office->id,
    ]);

    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Document::class,
        'subject_id' => $document->id,
        'action' => 'document.transferred',
    ]);
});

test('viewer cannot update a document location via the api', function () {
    $viewer = User::factory()->viewer()->create();

    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $office = StorageLocation::factory()->create();
    $centralStorage = StorageLocation::factory()->create();

    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $office->id,
    ]);

    $response = $this->actingAs($viewer, 'sanctum')->patchJson("/api/v1/documents/{$document->reference}/location", [
        'to_storage_location_id' => $centralStorage->id,
    ]);

    $response->assertStatus(403)
        ->assertJson(['success' => false]);

    expect($document->fresh()->storage_location_id)->toBe($office->id);
});

test('updating the location of an unknown reference returns not found', function () {
    $editor = User::factory()->editor()->create();
    $storageLocation = StorageLocation::factory()->create();

    $response = $this->actingAs($editor, 'sanctum')->patchJson('/api/v1/documents/does-not-exist/location', [
        'to_storage_location_id' => $storageLocation->id,
    ]);

    $response->assertStatus(404)
        ->assertJson(['success' => false]);
});
