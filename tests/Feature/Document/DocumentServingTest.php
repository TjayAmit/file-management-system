<?php

use App\Models\AccessLog;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

function uploadDocumentForServing(User $editor): Document
{
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $file = UploadedFile::fake()->create('scan.pdf', 100, 'application/pdf');

    test()->actingAs($editor)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => $requestType->id,
            'storage_location_id' => $storage->id,
            'title' => 'Servable Doc',
            'document_date' => '2026-07-28',
            'file' => $file,
        ]);

    return Document::where('title', 'Servable Doc')->firstOrFail();
}

test('serving the document file requires authentication', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $document = uploadDocumentForServing($editor);

    Auth::logout();

    $response = $this->get(route('documents.file', $document->reference).'?action=view');

    $response->assertRedirect(route('login'));
});

test('any authenticated role can view, download, or print a document and an access log is written', function (string $action) {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $document = uploadDocumentForServing($editor);

    $viewer = User::factory()->viewer()->create();

    $response = $this->actingAs($viewer)
        ->get(route('documents.file', $document->reference).'?action='.$action);

    $response->assertOk();

    $this->assertDatabaseHas('access_logs', [
        'user_id' => $viewer->id,
        'document_id' => $document->id,
        'action' => $action,
    ]);
})->with(['view', 'download', 'print']);

test('search listings are not logged as access', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    uploadDocumentForServing($editor);

    $this->actingAs($editor)->get(route('documents.index'));

    expect(AccessLog::count())->toBe(0);
});

test('an invalid action is rejected', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $document = uploadDocumentForServing($editor);

    $response = $this->actingAs($editor)
        ->get(route('documents.file', $document->reference).'?action=delete');

    $response->assertSessionHasErrors('action');
});
