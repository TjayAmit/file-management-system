<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('the encode-document form lists branches, request types, and storage locations for an editor', function () {
    $editor = User::factory()->editor()->create();

    $business = Business::factory()->create(['name' => 'ABC Corp']);
    $branch = Branch::factory()->create(['business_id' => $business->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $response = $this->actingAs($editor)->get(route('documents.create'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('documents/create')
        ->has('branches', 1)
        ->where('branches.0.id', $branch->id)
        ->has('requestTypes', 1)
        ->where('requestTypes.0.id', $requestType->id)
        ->has('storageLocations', 1)
        ->where('storageLocations.0.id', $storage->id)
    );
});

test('the encode-document form pre-selects the branch narrowed by search', function () {
    $editor = User::factory()->editor()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);

    $response = $this->actingAs($editor)
        ->get(route('documents.create', ['branch_id' => $branch->id]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('filters.branch_id', $branch->id)
    );
});

test('a viewer cannot reach the encode-document form', function () {
    $viewer = User::factory()->viewer()->create();

    $response = $this->actingAs($viewer)->get(route('documents.create'));

    $response->assertStatus(403);
});

test('uploading from the encode-document flow makes the document immediately available to print', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $file = UploadedFile::fake()->create('scan.pdf', 100, 'application/pdf');

    $response = $this->actingAs($editor)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => $requestType->id,
            'storage_location_id' => $storage->id,
            'title' => 'Just Encoded',
            'document_date' => '2026-07-28',
            'file' => $file,
        ]);

    $document = Document::where('title', 'Just Encoded')->firstOrFail();
    $response->assertRedirect(route('documents.show', $document->reference));

    // Print is only reachable once the document exists — i.e. after upload.
    $printResponse = $this->actingAs($editor)
        ->get(route('documents.file', $document->reference).'?action=print');

    $printResponse->assertOk();
});

test('printing a document that has never been uploaded is not possible', function () {
    $editor = User::factory()->editor()->create();

    $response = $this->actingAs($editor)
        ->get(route('documents.file', 'not-a-real-reference').'?action=print');

    $response->assertNotFound();
});
