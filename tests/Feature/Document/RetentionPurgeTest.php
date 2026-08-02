<?php

use App\Models\AccessLog;
use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\SearchLog;
use Illuminate\Support\Facades\Storage;

test('superseded document versions older than 90 days are purged and their files removed', function () {
    Storage::fake('private');

    $document = Document::factory()->create();

    $oldVersion = DocumentVersion::factory()->create([
        'document_id' => $document->id,
        'path' => 'documents/old.pdf',
        'is_current' => false,
        'created_at' => now()->subDays(91),
    ]);
    Storage::disk('private')->put($oldVersion->path, 'old content');

    $this->artisan('documents:purge-expired')->assertSuccessful();

    $this->assertDatabaseMissing('document_versions', ['id' => $oldVersion->id]);
    Storage::disk('private')->assertMissing($oldVersion->path);
});

test('superseded document versions within 90 days are left untouched', function () {
    Storage::fake('private');

    $document = Document::factory()->create();

    $recentVersion = DocumentVersion::factory()->create([
        'document_id' => $document->id,
        'path' => 'documents/recent.pdf',
        'is_current' => false,
        'created_at' => now()->subDays(10),
    ]);
    Storage::disk('private')->put($recentVersion->path, 'recent content');

    $this->artisan('documents:purge-expired')->assertSuccessful();

    $this->assertDatabaseHas('document_versions', ['id' => $recentVersion->id]);
    Storage::disk('private')->assertExists($recentVersion->path);
});

test('the current document version is never purged regardless of age', function () {
    Storage::fake('private');

    $document = Document::factory()->create();

    $currentVersion = DocumentVersion::factory()->create([
        'document_id' => $document->id,
        'path' => 'documents/current.pdf',
        'is_current' => true,
        'created_at' => now()->subDays(200),
    ]);
    Storage::disk('private')->put($currentVersion->path, 'current content');

    $this->artisan('documents:purge-expired')->assertSuccessful();

    $this->assertDatabaseHas('document_versions', ['id' => $currentVersion->id]);
    Storage::disk('private')->assertExists($currentVersion->path);
});

test('soft-deleted documents older than 90 days are purged along with their files', function () {
    Storage::fake('private');

    $document = Document::factory()->create();
    $version = DocumentVersion::factory()->create([
        'document_id' => $document->id,
        'path' => 'documents/deleted.pdf',
        'is_current' => true,
    ]);
    Storage::disk('private')->put($version->path, 'content');

    $accessLog = AccessLog::factory()->create(['document_id' => $document->id]);
    $searchLog = SearchLog::factory()->create(['opened_document_id' => $document->id]);

    $document->delete();
    $document->forceFill(['deleted_at' => now()->subDays(91)])->saveQuietly();

    $this->artisan('documents:purge-expired')->assertSuccessful();

    $this->assertDatabaseMissing('documents', ['id' => $document->id]);
    $this->assertDatabaseMissing('document_versions', ['id' => $version->id]);
    $this->assertDatabaseMissing('access_logs', ['id' => $accessLog->id]);
    $this->assertDatabaseHas('search_logs', ['id' => $searchLog->id, 'opened_document_id' => null]);
    Storage::disk('private')->assertMissing($version->path);
});

test('soft-deleted documents within 90 days are left untouched', function () {
    Storage::fake('private');

    $document = Document::factory()->create();
    $version = DocumentVersion::factory()->create([
        'document_id' => $document->id,
        'path' => 'documents/recently-deleted.pdf',
        'is_current' => true,
    ]);
    Storage::disk('private')->put($version->path, 'content');

    $document->delete();

    $this->artisan('documents:purge-expired')->assertSuccessful();

    $this->assertDatabaseHas('documents', ['id' => $document->id]);
    $this->assertDatabaseHas('document_versions', ['id' => $version->id]);
    Storage::disk('private')->assertExists($version->path);
});

test('live documents are never purged', function () {
    Storage::fake('private');

    $document = Document::factory()->create();
    $version = DocumentVersion::factory()->create([
        'document_id' => $document->id,
        'path' => 'documents/live.pdf',
        'is_current' => true,
    ]);
    Storage::disk('private')->put($version->path, 'content');

    $this->artisan('documents:purge-expired')->assertSuccessful();

    $this->assertDatabaseHas('documents', ['id' => $document->id]);
    Storage::disk('private')->assertExists($version->path);
});
