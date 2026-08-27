<?php

use App\Models\AccessLog;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('only an admin can read who has opened documents', function () {
    $admin = User::factory()->admin()->create();
    $editor = User::factory()->editor()->create();
    $viewer = User::factory()->viewer()->create();

    AccessLog::factory()->create(['user_id' => $viewer->id]);

    $this->actingAs($viewer)
        ->get(route('admin.access-logs.index'))
        ->assertStatus(403);

    $this->actingAs($editor)
        ->get(route('admin.access-logs.index'))
        ->assertStatus(403);

    $this->actingAs($admin)
        ->get(route('admin.access-logs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/access-logs/index')
            ->has('accessLogs.data', 1)
        );
});

test('serving a document puts a readable entry in the log', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $admin = User::factory()->admin()->create();

    $document = Document::factory()->create();
    $document->versions()->create([
        'path' => UploadedFile::fake()->create('scan.pdf', 10, 'application/pdf')->store('documents', 'private'),
        'original_name' => 'scan.pdf',
        'size' => 1024,
        'mime_type' => 'application/pdf',
        'is_current' => true,
        'uploaded_by' => $editor->id,
    ]);

    $this->actingAs($editor)
        ->get(route('documents.file', ['reference' => $document->reference, 'action' => 'print']))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.access-logs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('accessLogs.data', 1)
            ->where('accessLogs.data.0.action', 'print')
            ->where('accessLogs.data.0.user.name', $editor->name)
            ->where('accessLogs.data.0.document.reference', $document->reference)
        );
});

test('the log filters by action, by staff member, and by document', function () {
    $admin = User::factory()->admin()->create();
    $clerk = User::factory()->viewer()->create();
    $other = User::factory()->viewer()->create();

    $document = Document::factory()->create();

    AccessLog::factory()->create([
        'user_id' => $clerk->id,
        'document_id' => $document->id,
        'action' => 'download',
    ]);
    AccessLog::factory()->create([
        'user_id' => $other->id,
        'action' => 'view',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.access-logs.index', ['action' => 'download']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('accessLogs.data', 1)
            ->where('accessLogs.data.0.action', 'download'));

    $this->actingAs($admin)
        ->get(route('admin.access-logs.index', ['user_id' => $other->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('accessLogs.data', 1)
            ->where('accessLogs.data.0.user.id', $other->id));

    $this->actingAs($admin)
        ->get(route('admin.access-logs.index', ['reference' => $document->reference]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('accessLogs.data', 1)
            ->where('accessLogs.data.0.document.reference', $document->reference));
});

test('a document is filtered by its opaque reference, never by its internal id', function () {
    $admin = User::factory()->admin()->create();
    $document = Document::factory()->create();

    AccessLog::factory()->create(['document_id' => $document->id]);

    $this->actingAs($admin)
        ->get(route('admin.access-logs.index', ['document_id' => $document->id]))
        ->assertSessionHasErrors('document_id');
});

test('an admin sees the access history on the document page and others do not', function () {
    $admin = User::factory()->admin()->create();
    $editor = User::factory()->editor()->create();
    $document = Document::factory()->create();

    AccessLog::factory()->create([
        'user_id' => $editor->id,
        'document_id' => $document->id,
        'action' => 'view',
    ]);

    $this->actingAs($admin)
        ->get(route('documents.show', $document->reference))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('can.viewAccessLog', true)
            ->has('accessLogs', 1)
            ->where('accessLogs.0.action', 'view')
        );

    $this->actingAs($editor)
        ->get(route('documents.show', $document->reference))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('can.viewAccessLog', false)
            ->where('accessLogs', null)
        );
});
