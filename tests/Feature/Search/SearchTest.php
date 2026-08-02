<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\User;

test('found state returns documents when the business is known and has encoded documents', function () {
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
    $response->assertInertia(fn ($page) => $page
        ->where('result.state', 'found')
        ->where('result.business.id', $business->id)
        ->has('result.documents', 1)
    );
});

test('known business, nothing encoded state is returned when the business has no branches', function () {
    $user = User::factory()->viewer()->create();

    Business::factory()->create(['name' => 'Dormant Enterprise']);

    $response = $this->actingAs($user)
        ->get(route('search.index', ['business' => 'Dormant Enterprise']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('result.state', 'known_no_documents')
        ->where('result.business.name', 'Dormant Enterprise')
        ->has('result.documents', 0)
    );
});

test('known business, nothing encoded state is returned when branches exist but nothing is encoded', function () {
    $user = User::factory()->viewer()->create();

    $business = Business::factory()->create(['name' => 'Jollibee']);
    Branch::factory()->create(['business_id' => $business->id]);

    $response = $this->actingAs($user)
        ->get(route('search.index', ['business' => 'Jollibee']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('result.state', 'known_no_documents')
        ->has('result.documents', 0)
    );
});

test('unknown state is returned when the business is not in the known list, never a denial', function () {
    $user = User::factory()->viewer()->create();

    $response = $this->actingAs($user)
        ->get(route('search.index', ['business' => 'Nonexistent Corp']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('result.state', 'unknown')
        ->where('result.business', null)
    );
});

test('no search is performed when neither a business name nor id is given', function () {
    $user = User::factory()->viewer()->create();

    $response = $this->actingAs($user)
        ->get(route('search.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('result', null));
});

test('narrowing chain filters by business, then branch, then request type', function () {
    $user = User::factory()->viewer()->create();

    $business = Business::factory()->create(['name' => 'ABC Corp']);
    $branchA = Branch::factory()->create(['business_id' => $business->id, 'location' => 'Main St']);
    $branchB = Branch::factory()->create(['business_id' => $business->id, 'location' => 'Rizal St']);
    $inspection = RequestType::factory()->create(['name' => 'Setback Inspection']);
    $permit = RequestType::factory()->create(['name' => 'Building Permit']);

    $matching = Document::factory()->create([
        'branch_id' => $branchA->id,
        'request_type_id' => $inspection->id,
    ]);
    Document::factory()->create([
        'branch_id' => $branchB->id,
        'request_type_id' => $inspection->id,
    ]);
    Document::factory()->create([
        'branch_id' => $branchA->id,
        'request_type_id' => $permit->id,
    ]);

    $response = $this->actingAs($user)
        ->get(route('search.index', [
            'business_id' => $business->id,
            'branch_id' => $branchA->id,
            'request_type_id' => $inspection->id,
        ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('result.state', 'found')
        ->has('result.documents', 1)
        ->where('result.documents.0.id', $matching->id)
    );
});

test('results are sorted by the operative date, falling back to request date when no approval date exists', function () {
    $user = User::factory()->viewer()->create();

    $business = Business::factory()->create(['name' => 'ABC Corp']);
    $branch = Branch::factory()->create(['business_id' => $business->id]);
    $requestType = RequestType::factory()->create();

    $oldest = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'approval_date' => '2026-01-01',
        'request_date' => null,
    ]);
    $newestByRequestDateOnly = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'approval_date' => null,
        'request_date' => '2026-06-01',
    ]);
    $middle = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'approval_date' => '2026-03-01',
        'request_date' => '2026-01-15',
    ]);

    $response = $this->actingAs($user)
        ->get(route('search.index', ['business_id' => $business->id]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('result.state', 'found')
        ->where('result.documents.0.id', $newestByRequestDateOnly->id)
        ->where('result.documents.1.id', $middle->id)
        ->where('result.documents.2.id', $oldest->id)
    );
});

test('address-first query returns the right branch with its business and documents', function () {
    $user = User::factory()->viewer()->create();

    $business = Business::factory()->create(['name' => 'ABC Corp']);
    $branch = Branch::factory()->create(['business_id' => $business->id, 'location' => 'Rizal St']);
    $requestType = RequestType::factory()->create();
    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
    ]);

    Branch::factory()->create(['location' => 'Main St']);

    $response = $this->actingAs($user)
        ->get(route('search.index', ['location' => 'Rizal']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('locationResults', 1)
        ->where('locationResults.0.id', $branch->id)
        ->where('locationResults.0.location', 'Rizal St')
        ->where('locationResults.0.business.id', $business->id)
        ->has('locationResults.0.documents', 1)
        ->where('locationResults.0.documents.0.id', $document->id)
    );
});

test('address-first query matches multiple branches sharing part of an address', function () {
    $user = User::factory()->viewer()->create();

    $branchA = Branch::factory()->create(['location' => 'Rizal St corner Main']);
    $branchB = Branch::factory()->create(['location' => 'Rizal Avenue']);
    Branch::factory()->create(['location' => 'Bonifacio St']);

    $response = $this->actingAs($user)
        ->get(route('search.index', ['location' => 'Rizal']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('locationResults', 2)
        ->where('locationResults.0.id', $branchA->id)
        ->where('locationResults.1.id', $branchB->id)
    );
});

test('address-first query with a known branch but nothing encoded reports it as such', function () {
    $user = User::factory()->viewer()->create();

    $branch = Branch::factory()->create(['location' => 'Rizal St']);

    $response = $this->actingAs($user)
        ->get(route('search.index', ['location' => 'Rizal']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('locationResults', 1)
        ->where('locationResults.0.id', $branch->id)
        ->has('locationResults.0.documents', 0)
    );
});

test('address-first query returns an empty list, never a denial, when no branch matches', function () {
    $user = User::factory()->viewer()->create();

    $response = $this->actingAs($user)
        ->get(route('search.index', ['location' => 'Nonexistent Ave']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->has('locationResults', 0));
});

test('address-first query excludes hidden documents pending deletion', function () {
    $user = User::factory()->viewer()->create();

    $branch = Branch::factory()->create(['location' => 'Rizal St']);
    $requestType = RequestType::factory()->create();
    Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'is_hidden' => true,
    ]);

    $response = $this->actingAs($user)
        ->get(route('search.index', ['location' => 'Rizal']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('locationResults', 1)
        ->has('locationResults.0.documents', 0)
    );
});

test('no location search is performed when the location query is blank', function () {
    $user = User::factory()->viewer()->create();

    $response = $this->actingAs($user)
        ->get(route('search.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('locationResults', null));
});

test('hidden documents pending deletion are excluded from search results', function () {
    $user = User::factory()->viewer()->create();

    $business = Business::factory()->create(['name' => 'ABC Corp']);
    $branch = Branch::factory()->create(['business_id' => $business->id]);
    $requestType = RequestType::factory()->create();

    Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'is_hidden' => true,
    ]);

    $response = $this->actingAs($user)
        ->get(route('search.index', ['business_id' => $business->id]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('result.state', 'known_no_documents')
        ->has('result.documents', 0)
    );
});
