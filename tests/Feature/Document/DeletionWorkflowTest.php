<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function uploadDocument(User $editor): Document
{
    Storage::fake('private');

    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    test()->actingAs($editor)->post(route('documents.store'), [
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $storage->id,
        'title' => 'Doc Title',
        'document_date' => '2026-07-28',
        'file' => UploadedFile::fake()->create('v1.pdf', 100, 'application/pdf'),
    ]);

    return Document::where('title', 'Doc Title')->firstOrFail();
}

test('filing a deletion request requires a justification', function () {
    $editor = User::factory()->editor()->create();
    $document = uploadDocument($editor);

    $response = $this->actingAs($editor)
        ->post(route('documents.deletion-requests.store', $document->reference), [
            'reason' => '',
        ]);

    $response->assertSessionHasErrors('reason');
});

test('filing a deletion request hides the document from search and logs the request', function () {
    $editor = User::factory()->editor()->create();
    $document = uploadDocument($editor);

    $response = $this->actingAs($editor)
        ->post(route('documents.deletion-requests.store', $document->reference), [
            'reason' => 'Uploaded the wrong document by mistake.',
        ]);

    $response->assertRedirect();

    $document->refresh();
    expect($document->is_hidden)->toBeTrue();

    $this->assertDatabaseHas('deletion_requests', [
        'document_id' => $document->id,
        'requested_by' => $editor->id,
        'reason' => 'Uploaded the wrong document by mistake.',
        'status' => 'pending',
    ]);

    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Document::class,
        'subject_id' => $document->id,
        'action' => 'deletion.requested',
    ]);
});

test('rejecting a deletion request restores the document to search and logs the decision', function () {
    $editor = User::factory()->editor()->create();
    $admin = User::factory()->admin()->create();
    $document = uploadDocument($editor);

    $this->actingAs($editor)
        ->post(route('documents.deletion-requests.store', $document->reference), [
            'reason' => 'Wrong document uploaded.',
        ]);

    $deletionRequest = $document->deletionRequests()->latest('id')->firstOrFail();

    $response = $this->actingAs($admin)
        ->post(route('deletion-requests.reject', $deletionRequest));

    $response->assertRedirect();

    $document->refresh();
    expect($document->is_hidden)->toBeFalse();
    expect($document->trashed())->toBeFalse();

    $this->assertDatabaseHas('deletion_requests', [
        'id' => $deletionRequest->id,
        'status' => 'rejected',
        'approved_by' => $admin->id,
    ]);

    $this->assertDatabaseHas('activities', [
        'user_id' => $admin->id,
        'subject_type' => Document::class,
        'subject_id' => $document->id,
        'action' => 'deletion.rejected',
    ]);
});

test('approving a deletion request soft-deletes the document and logs the decision', function () {
    $editor = User::factory()->editor()->create();
    $admin = User::factory()->admin()->create();
    $document = uploadDocument($editor);

    $this->actingAs($editor)
        ->post(route('documents.deletion-requests.store', $document->reference), [
            'reason' => 'Wrong document uploaded.',
        ]);

    $deletionRequest = $document->deletionRequests()->latest('id')->firstOrFail();

    $response = $this->actingAs($admin)
        ->post(route('deletion-requests.approve', $deletionRequest));

    $response->assertRedirect();

    expect($document->fresh()->trashed())->toBeTrue();

    $this->assertDatabaseHas('deletion_requests', [
        'id' => $deletionRequest->id,
        'status' => 'approved',
        'approved_by' => $admin->id,
    ]);

    $this->assertDatabaseHas('activities', [
        'user_id' => $admin->id,
        'subject_type' => Document::class,
        'subject_id' => $document->id,
        'action' => 'deletion.approved',
    ]);
});

test('a deletion request cannot be decided twice', function () {
    $editor = User::factory()->editor()->create();
    $admin = User::factory()->admin()->create();
    $document = uploadDocument($editor);

    $this->actingAs($editor)
        ->post(route('documents.deletion-requests.store', $document->reference), [
            'reason' => 'Wrong document uploaded.',
        ]);

    $deletionRequest = $document->deletionRequests()->latest('id')->firstOrFail();

    $this->actingAs($admin)->post(route('deletion-requests.approve', $deletionRequest));

    $response = $this->actingAs($admin)->post(route('deletion-requests.reject', $deletionRequest));

    $response->assertStatus(409);
});

test('viewer role is denied filing and deciding deletion requests', function () {
    $editor = User::factory()->editor()->create();
    $viewer = User::factory()->viewer()->create();
    $document = uploadDocument($editor);

    $fileResponse = $this->actingAs($viewer)
        ->post(route('documents.deletion-requests.store', $document->reference), [
            'reason' => 'Not allowed.',
        ]);
    $fileResponse->assertStatus(403);

    $this->actingAs($editor)
        ->post(route('documents.deletion-requests.store', $document->reference), [
            'reason' => 'Wrong document uploaded.',
        ]);

    $deletionRequest = $document->deletionRequests()->latest('id')->firstOrFail();

    $approveResponse = $this->actingAs($viewer)
        ->post(route('deletion-requests.approve', $deletionRequest));
    $approveResponse->assertStatus(403);

    $editorApproveResponse = $this->actingAs($editor)
        ->post(route('deletion-requests.approve', $deletionRequest));
    $editorApproveResponse->assertStatus(403);
});
