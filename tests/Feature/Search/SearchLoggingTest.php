<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\SearchLog;
use App\Models\User;

test('a search log row is written when a business search resolves to found', function () {
    $user = User::factory()->viewer()->create();

    $business = Business::factory()->create(['name' => 'McDonalds']);
    $branch = Branch::factory()->create(['business_id' => $business->id]);
    $requestType = RequestType::factory()->create();
    Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
    ]);

    $response = $this->actingAs($user)
        ->get(route('search.index', ['business' => 'McDonalds']));

    $response->assertOk();

    $this->assertDatabaseHas('search_logs', [
        'user_id' => $user->id,
        'query' => 'McDonalds',
        'result_count' => 1,
        'opened_document_id' => null,
    ]);

    $response->assertInertia(fn ($page) => $page->where('result.search_log_id', SearchLog::first()->id));
});

test('a search log row is written when a business search resolves to unknown', function () {
    $user = User::factory()->viewer()->create();

    $this->actingAs($user)
        ->get(route('search.index', ['business' => 'Nonexistent Corp']))
        ->assertOk();

    $this->assertDatabaseHas('search_logs', [
        'user_id' => $user->id,
        'query' => 'Nonexistent Corp',
        'result_count' => 0,
        'opened_document_id' => null,
    ]);
});

test('a search log row is written when a business search resolves to known with nothing encoded', function () {
    $user = User::factory()->viewer()->create();

    Business::factory()->create(['name' => 'Dormant Enterprise']);

    $this->actingAs($user)
        ->get(route('search.index', ['business' => 'Dormant Enterprise']))
        ->assertOk();

    $this->assertDatabaseHas('search_logs', [
        'user_id' => $user->id,
        'query' => 'Dormant Enterprise',
        'result_count' => 0,
        'opened_document_id' => null,
    ]);
});

test('a search log row is written for an address-first location search', function () {
    $user = User::factory()->viewer()->create();

    Branch::factory()->create(['location' => 'Rizal St']);

    $this->actingAs($user)
        ->get(route('search.index', ['location' => 'Rizal']))
        ->assertOk();

    $this->assertDatabaseHas('search_logs', [
        'user_id' => $user->id,
        'query' => 'Rizal',
        'result_count' => 1,
        'opened_document_id' => null,
    ]);
});

test('no search log row is written when neither business nor location is queried', function () {
    $user = User::factory()->viewer()->create();

    $this->actingAs($user)->get(route('search.index'))->assertOk();

    $this->assertDatabaseCount('search_logs', 0);
});

test('opening a document from search results records the open on its search log', function () {
    $user = User::factory()->viewer()->create();

    $business = Business::factory()->create(['name' => 'McDonalds']);
    $branch = Branch::factory()->create(['business_id' => $business->id]);
    $requestType = RequestType::factory()->create();
    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
    ]);

    $this->actingAs($user)
        ->get(route('search.index', ['business' => 'McDonalds']))
        ->assertOk();

    $searchLog = SearchLog::firstOrFail();
    expect($searchLog->opened_document_id)->toBeNull();

    $this->actingAs($user)
        ->get(route('documents.show', $document->reference).'?search_log='.$searchLog->id)
        ->assertOk();

    expect($searchLog->fresh()->opened_document_id)->toBe($document->id);
});

test('opening a document without a search log reference does not touch any search log', function () {
    $user = User::factory()->viewer()->create();

    $branch = Branch::factory()->create();
    $requestType = RequestType::factory()->create();
    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
    ]);

    $searchLog = SearchLog::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('documents.show', $document->reference))
        ->assertOk();

    expect($searchLog->fresh()->opened_document_id)->toBeNull();
});

test('hit-rate report aggregates total searches, hits, misses, and hit rate', function () {
    $admin = User::factory()->admin()->create();

    SearchLog::factory()->create(['opened_document_id' => null]);
    SearchLog::factory()->create(['opened_document_id' => null]);
    $document = Document::factory()->create();
    SearchLog::factory()->create(['opened_document_id' => $document->id]);

    $response = $this->actingAs($admin)->get(route('search.report'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('report.total', 3)
        ->where('report.hits', 1)
        ->where('report.misses', 2)
        ->where('report.hit_rate', 33.33)
    );
});

test('hit-rate report is empty when no searches have been logged', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('search.report'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('report.total', 0)
        ->where('report.hits', 0)
        ->where('report.misses', 0)
        ->where('report.hit_rate', 0)
    );
});

test('the hit-rate report is restricted to admins', function () {
    $viewer = User::factory()->viewer()->create();

    $this->actingAs($viewer)->get(route('search.report'))->assertForbidden();
});
