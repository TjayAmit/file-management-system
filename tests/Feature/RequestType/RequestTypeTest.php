<?php

use App\Models\Activity;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;

test('typeahead suggestion returns matching request types by name', function () {
    $user = User::factory()->viewer()->create();

    RequestType::factory()->create(['name' => 'Business Permit Application']);
    RequestType::factory()->create(['name' => 'Building Permit']);
    RequestType::factory()->create(['name' => 'Sanitary Clearance']);

    $response = $this->actingAs($user)
        ->getJson(route('api.v1.request-types.index', ['query' => 'Permit']));

    $response->assertStatus(200)
        ->assertJsonCount(2, 'data');
});

test('request type creation and update allowed for editor', function () {
    $editor = User::factory()->editor()->create();

    $response = $this->actingAs($editor)
        ->post(route('request-types.store'), [
            'name' => 'Fire Safety Clearance',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('request_types', ['name' => 'Fire Safety Clearance']);

    $type = RequestType::where('name', 'Fire Safety Clearance')->first();

    $this->actingAs($editor)
        ->patch(route('request-types.update', $type), [
            'name' => 'Fire Safety Inspection Certificate',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('request_types', ['id' => $type->id, 'name' => 'Fire Safety Inspection Certificate']);
});

test('merging request types re-points documents, soft deletes duplicate, and logs activity', function () {
    $editor = User::factory()->editor()->create();

    $target = RequestType::factory()->create(['name' => 'Business Permit']);
    $source = RequestType::factory()->create(['name' => 'Mayor\'s Permit']);

    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $storage = StorageLocation::factory()->create();

    $doc1 = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $source->id,
        'storage_location_id' => $storage->id,
    ]);

    $doc2 = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $target->id,
        'storage_location_id' => $storage->id,
    ]);

    $response = $this->actingAs($editor)
        ->post(route('request-types.merge'), [
            'source_request_type_id' => $source->id,
            'target_request_type_id' => $target->id,
        ]);

    $response->assertRedirect();

    // Documents re-pointed
    expect($doc1->fresh()->request_type_id)->toBe($target->id);
    expect($doc2->fresh()->request_type_id)->toBe($target->id);

    // Source soft deleted
    expect($source->fresh()->trashed())->toBeTrue();

    // Activity logged
    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => RequestType::class,
        'subject_id' => $target->id,
        'action' => 'request_type.merged',
    ]);
});
