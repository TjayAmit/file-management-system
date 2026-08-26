<?php

use App\Models\DeletionRequest;
use App\Models\Document;
use App\Models\StorageLocation;
use App\Models\Transfer;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

test('the dashboard shows real archive statistics', function () {
    Document::factory()->count(3)->create();

    $this->actingAs(User::factory()->editor()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('dashboard')
            ->where('statistics.documents', 3)
            ->has('statistics.by_storage_location')
            ->where('can.encode', true)
        );
});

test('the dashboard hides the hit-rate report from non-admins', function () {
    $this->actingAs(User::factory()->viewer()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('hitRate', null)
            ->where('can.encode', false)
            ->where('can.viewReport', false)
        );
});

test('the dashboard gives an admin the hit-rate report and recent activity', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('hitRate')
            ->has('recentActivity')
            ->where('can.viewReport', true)
        );
});

test('the document index paginates and filters', function () {
    $wanted = Document::factory()->create(['title' => 'Setback inspection request']);
    Document::factory()->count(2)->create(['title' => 'Something else entirely']);

    $this->actingAs(User::factory()->viewer()->create())
        ->get(route('documents.index', ['query' => 'Setback']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('documents/index')
            ->has('documents.data', 1)
            ->where('documents.data.0.reference', $wanted->reference)
        );
});

test('the document index rejects an out-of-range page size', function () {
    $this->actingAs(User::factory()->viewer()->create())
        ->get(route('documents.index', ['per_page' => 5000]))
        ->assertSessionHasErrors('per_page');
});

test('the transfer page lists past batches for any staff account', function () {
    Transfer::factory()->create();

    $this->actingAs(User::factory()->viewer()->create())
        ->get(route('transfers.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('transfers/index')
            ->has('transfers.data', 1)
            ->where('can.transfer', false)
        );
});

test('an editor sees the transfer form on the transfer page', function () {
    $this->actingAs(User::factory()->editor()->create())
        ->get(route('transfers.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('can.transfer', true));
});

test('the deletion request queue is open to editors and admins but closed to viewers', function () {
    DeletionRequest::factory()->create();

    $this->actingAs(User::factory()->viewer()->create())
        ->get(route('deletion-requests.index'))
        ->assertStatus(403);

    $this->actingAs(User::factory()->editor()->create())
        ->get(route('deletion-requests.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('deletion-requests/index')
            ->has('deletionRequests', 1)
            ->where('can.decide', false)
        );

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('deletion-requests.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('can.decide', true));
});

test('the storage location page tells the view whether it may manage locations', function () {
    StorageLocation::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('storage-locations.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('can.manage', true));

    $this->actingAs(User::factory()->editor()->create())
        ->get(route('storage-locations.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('can.manage', false));
});

test('the document page exposes the edit, history and version surfaces it is allowed to show', function () {
    $document = Document::factory()->create();

    $this->actingAs(User::factory()->editor()->create())
        ->get(route('documents.show', $document->reference))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('documents/show')
            ->has('branches')
            ->has('requestTypes')
            ->where('can.update', true)
            ->where('can.requestDeletion', true)
        );

    $this->actingAs(User::factory()->viewer()->create())
        ->get(route('documents.show', $document->reference))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('can.update', false)
            ->where('can.requestDeletion', false)
        );
});
