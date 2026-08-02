<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;

test('document show page lists current location and available storage locations for an editor', function () {
    $editor = User::factory()->editor()->create();

    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $office = StorageLocation::factory()->create(['name' => 'In Office']);
    StorageLocation::factory()->create(['name' => 'Central Storage Building']);

    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $office->id,
    ]);

    $response = $this->actingAs($editor)->get(route('documents.show', $document->reference));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('documents/show')
        ->where('document.storage_location.name', 'In Office')
        ->has('storageLocations', 2)
    );
});

test('editor can manually update a document physical location, and the change is logged', function () {
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

    $response = $this->actingAs($editor)
        ->patch(route('documents.update', $document->reference), [
            'storage_location_id' => $centralStorage->id,
        ]);

    $response->assertRedirect();
    expect($document->fresh()->storage_location_id)->toBe($centralStorage->id);

    $this->assertDatabaseHas('change_histories', [
        'document_id' => $document->id,
        'field' => 'storage_location_id',
        'old_value' => (string) $office->id,
        'new_value' => (string) $centralStorage->id,
        'changed_by' => $editor->id,
        'is_revert' => false,
    ]);

    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Document::class,
        'subject_id' => $document->id,
        'action' => 'document.updated',
    ]);
});

test('viewer cannot manually update a document physical location', function () {
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

    $response = $this->actingAs($viewer)
        ->patch(route('documents.update', $document->reference), [
            'storage_location_id' => $centralStorage->id,
        ]);

    $response->assertForbidden();
    expect($document->fresh()->storage_location_id)->toBe($office->id);
});
