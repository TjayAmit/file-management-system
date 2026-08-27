<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\User;

test('an editor can print a label sheet for a single document', function () {
    $editor = User::factory()->editor()->create();
    $document = Document::factory()->create(['title' => 'Setback inspection']);

    $this->actingAs($editor)
        ->get(route('documents.qr-labels', ['references' => [$document->reference]]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('documents/qr-labels')
            ->has('labels', 1)
            ->where('labels.0.reference', $document->reference)
            ->where('labels.0.title', 'Setback inspection')
        );
});

test('the label carries the card in plain text beside the code', function () {
    $editor = User::factory()->editor()->create();
    $business = Business::factory()->create(['name' => 'ABC Corporation']);
    $branch = Branch::factory()->create([
        'business_id' => $business->id,
        'location' => 'Rizal St',
    ]);
    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'approval_date' => '2026-03-12',
        'request_date' => '2026-02-01',
    ]);

    $this->actingAs($editor)
        ->get(route('documents.qr-labels', ['references' => [$document->reference]]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('labels.0.business', 'ABC Corporation')
            ->where('labels.0.branch', 'Rizal St')
            ->where('labels.0.main_date', '2026-03-12')
        );
});

test('a document with no approval date falls back to its request date', function () {
    $editor = User::factory()->editor()->create();
    $document = Document::factory()->create([
        'approval_date' => null,
        'request_date' => '2025-11-04',
    ]);

    $this->actingAs($editor)
        ->get(route('documents.qr-labels', ['references' => [$document->reference]]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('labels.0.main_date', '2025-11-04'));
});

test('the sheet embeds the qr as an svg fragment with no xml prolog', function () {
    $editor = User::factory()->editor()->create();
    $document = Document::factory()->create();

    $this->actingAs($editor)
        ->get(route('documents.qr-labels', ['references' => [$document->reference]]))
        ->assertOk()
        ->assertInertia(function ($page) {
            $qr = $page->toArray()['props']['labels'][0]['qr'];

            expect($qr)->toStartWith('<svg')
                ->and($qr)->not->toContain('<?xml');
        });
});

test('a batch prints one label per document, ordered by business then branch', function () {
    $editor = User::factory()->editor()->create();

    $alpha = Business::factory()->create(['name' => 'Alpha Trading']);

    $zuluBranch = Branch::factory()->create([
        'business_id' => Business::factory()->create(['name' => 'Zulu Trading'])->id,
        'location' => 'Mabini St',
    ]);
    $alphaRizal = Branch::factory()->create([
        'business_id' => $alpha->id,
        'location' => 'Rizal St',
    ]);
    $alphaBonifacio = Branch::factory()->create([
        'business_id' => $alpha->id,
        'location' => 'Bonifacio St',
    ]);

    $third = Document::factory()->create(['branch_id' => $zuluBranch->id]);
    $second = Document::factory()->create(['branch_id' => $alphaRizal->id]);
    $first = Document::factory()->create(['branch_id' => $alphaBonifacio->id]);

    $this->actingAs($editor)
        ->get(route('documents.qr-labels', [
            'references' => [$third->reference, $second->reference, $first->reference],
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('labels', 3)
            ->where('labels.0.branch', 'Bonifacio St')
            ->where('labels.1.branch', 'Rizal St')
            ->where('labels.2.business', 'Zulu Trading')
        );
});

test('a viewer cannot print labels', function () {
    $viewer = User::factory()->viewer()->create();
    $document = Document::factory()->create();

    $this->actingAs($viewer)
        ->get(route('documents.qr-labels', ['references' => [$document->reference]]))
        ->assertStatus(403);
});

test('the sheet is capped so one request cannot build an unprintable page', function () {
    $editor = User::factory()->editor()->create();

    $references = Document::factory()->count(61)->create()->pluck('reference')->all();

    $this->actingAs($editor)
        ->get(route('documents.qr-labels', ['references' => $references]))
        ->assertSessionHasErrors('references');
});

test('an unknown reference is rejected rather than silently skipped', function () {
    $editor = User::factory()->editor()->create();

    $this->actingAs($editor)
        ->get(route('documents.qr-labels', [
            'references' => ['3f2504e0-4f89-11d3-9a0c-0305e82c3301'],
        ]))
        ->assertSessionHasErrors('references.0');
});
