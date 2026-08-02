<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;

test('editor can batch transfer multiple documents via the api', function () {
    $editor = User::factory()->editor()->create();

    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $office = StorageLocation::factory()->create(['name' => 'In Office']);
    $centralStorage = StorageLocation::factory()->create(['name' => 'Central Storage Building']);

    $documents = Document::factory()->count(3)->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $office->id,
    ]);

    $response = $this->actingAs($editor, 'sanctum')->postJson('/api/v1/transfers', [
        'references' => $documents->pluck('reference')->all(),
        'to_storage_location_id' => $centralStorage->id,
        'note' => 'Quarterly batch transfer',
    ]);

    $response->assertStatus(201)
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('transfers', [
        'to_storage_location_id' => $centralStorage->id,
        'performed_by' => $editor->id,
        'note' => 'Quarterly batch transfer',
    ]);

    foreach ($documents as $document) {
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
    }
});

test('viewer cannot batch transfer via the api', function () {
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

    $response = $this->actingAs($viewer, 'sanctum')->postJson('/api/v1/transfers', [
        'references' => [$document->reference],
        'to_storage_location_id' => $centralStorage->id,
    ]);

    $response->assertStatus(403)
        ->assertJson(['success' => false]);

    expect($document->fresh()->storage_location_id)->toBe($office->id);
});

test('batch transfer rejects an unknown reference', function () {
    $editor = User::factory()->editor()->create();
    $storageLocation = StorageLocation::factory()->create();

    $response = $this->actingAs($editor, 'sanctum')->postJson('/api/v1/transfers', [
        'references' => ['does-not-exist'],
        'to_storage_location_id' => $storageLocation->id,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('references.0');
});
