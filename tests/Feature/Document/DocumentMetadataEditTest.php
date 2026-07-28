<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\ChangeHistory;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;

test('metadata edit creates detailed change history entry', function () {
    $editor = User::factory()->editor()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $storage->id,
        'title' => 'Original Title',
    ]);

    $response = $this->actingAs($editor)
        ->patch(route('documents.update', $document->reference), [
            'title' => 'Updated Title',
        ]);

    $response->assertRedirect();
    expect($document->fresh()->title)->toBe('Updated Title');

    $this->assertDatabaseHas('change_histories', [
        'document_id' => $document->id,
        'field' => 'title',
        'old_value' => 'Original Title',
        'new_value' => 'Updated Title',
        'changed_by' => $editor->id,
        'is_revert' => false,
    ]);
});

test('original editor can revert a change history entry', function () {
    $editor = User::factory()->editor()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $storage->id,
        'title' => 'Version 1 Title',
    ]);

    // Editor makes a change
    $this->actingAs($editor)
        ->patch(route('documents.update', $document->reference), [
            'title' => 'Version 2 Title',
        ]);

    $change = ChangeHistory::where('document_id', $document->id)->first();

    // Editor reverts their change
    $response = $this->actingAs($editor)
        ->post(route('documents.revert', ['reference' => $document->reference, 'changeHistory' => $change->id]));

    $response->assertRedirect();
    expect($document->fresh()->title)->toBe('Version 1 Title');

    $this->assertDatabaseHas('change_histories', [
        'document_id' => $document->id,
        'field' => 'title',
        'old_value' => 'Version 2 Title',
        'new_value' => 'Version 1 Title',
        'changed_by' => $editor->id,
        'is_revert' => true,
    ]);
});

test('admin can revert change made by a different editor as fallback', function () {
    $editor = User::factory()->editor()->create();
    $admin = User::factory()->admin()->create();

    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $storage->id,
        'title' => 'Initial Title',
    ]);

    // Editor makes a change
    $this->actingAs($editor)
        ->patch(route('documents.update', $document->reference), [
            'title' => 'Editor Changed Title',
        ]);

    $change = ChangeHistory::where('document_id', $document->id)->first();

    // Admin reverts editor's change
    $response = $this->actingAs($admin)
        ->post(route('documents.revert', ['reference' => $document->reference, 'changeHistory' => $change->id]));

    $response->assertRedirect();
    expect($document->fresh()->title)->toBe('Initial Title');
});

test('other non-admin editor is denied revert of another editor change', function () {
    $editor1 = User::factory()->editor()->create();
    $editor2 = User::factory()->editor()->create();

    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $storage->id,
        'title' => 'Start Title',
    ]);

    // Editor 1 makes a change
    $this->actingAs($editor1)
        ->patch(route('documents.update', $document->reference), [
            'title' => 'Editor 1 Title',
        ]);

    $change = ChangeHistory::where('document_id', $document->id)->first();

    // Editor 2 attempts revert -> denied 403
    $response = $this->actingAs($editor2)
        ->post(route('documents.revert', ['reference' => $document->reference, 'changeHistory' => $change->id]));

    $response->assertStatus(403);
    expect($document->fresh()->title)->toBe('Editor 1 Title');
});
