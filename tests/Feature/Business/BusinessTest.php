<?php

use App\Models\Activity;
use App\Models\Branch;
use App\Models\Business;
use App\Models\User;

test('typeahead suggestion returns matching businesses', function () {
    $user = User::factory()->viewer()->create();

    Business::factory()->create(['name' => 'McDonalds']);
    Business::factory()->create(['name' => 'McDo Express']);
    Business::factory()->create(['name' => 'Jollibee']);

    $response = $this->actingAs($user)
        ->get(route('businesses.index', ['query' => 'Mc']));

    $response->assertStatus(200);

    $apiResponse = $this->getJson(route('api.v1.businesses.index', ['query' => 'Mc']));
    $apiResponse->assertStatus(200)
        ->assertJsonCount(2, 'data');
});

test('editor and admin can create a business but viewer is denied', function () {
    $viewer = User::factory()->viewer()->create();
    $editor = User::factory()->editor()->create();

    // Viewer denied
    $this->actingAs($viewer)
        ->post(route('businesses.store'), ['name' => 'New Corp'])
        ->assertStatus(403);

    // Editor allowed
    $this->actingAs($editor)
        ->post(route('businesses.store'), ['name' => 'New Corp'])
        ->assertRedirect();

    $this->assertDatabaseHas('businesses', ['name' => 'New Corp']);
});

test('merging businesses re-points branches, soft deletes duplicate, and logs activity', function () {
    $editor = User::factory()->editor()->create();

    $target = Business::factory()->create(['name' => 'ABC Corporation']);
    $source = Business::factory()->create(['name' => 'ABC Corp']);

    $branch1 = Branch::factory()->create(['business_id' => $source->id, 'location' => 'Main St']);
    $branch2 = Branch::factory()->create(['business_id' => $target->id, 'location' => 'Rizal St']);

    $response = $this->actingAs($editor)
        ->post(route('businesses.merge'), [
            'source_id' => $source->id,
            'target_id' => $target->id,
        ]);

    $response->assertRedirect();

    // Branches re-pointed
    expect($branch1->fresh()->business_id)->toBe($target->id);
    expect($branch2->fresh()->business_id)->toBe($target->id);
    expect($target->branches()->count())->toBe(2);

    // Source soft deleted
    expect($source->fresh()->trashed())->toBeTrue();

    // Activity logged
    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Business::class,
        'subject_id' => $target->id,
        'action' => 'business.merged',
    ]);

    $activity = Activity::where('action', 'business.merged')->first();
    expect($activity->details['source_id'])->toBe($source->id);
});

test('a business may exist with zero branches', function () {
    $business = Business::factory()->create(['name' => 'Dormant Enterprise']);

    expect($business->branches)->toHaveCount(0);
    $this->assertDatabaseHas('businesses', ['name' => 'Dormant Enterprise']);
});

test('editor and admin can bulk seed businesses and branches but viewer is denied', function () {
    $viewer = User::factory()->viewer()->create();
    $editor = User::factory()->editor()->create();

    $this->actingAs($viewer)
        ->post(route('businesses.bulk-seed'), [
            'rows' => [['name' => 'Seed Corp', 'branch' => null]],
        ])
        ->assertStatus(403);

    $response = $this->actingAs($editor)
        ->post(route('businesses.bulk-seed'), [
            'rows' => [
                ['name' => 'Seed Corp', 'branch' => 'Main St'],
                ['name' => 'Pilot Business', 'branch' => null],
            ],
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('businesses', ['name' => 'Seed Corp']);
    $this->assertDatabaseHas('businesses', ['name' => 'Pilot Business']);

    $business = Business::where('name', 'Seed Corp')->first();
    $this->assertDatabaseHas('branches', ['business_id' => $business->id, 'location' => 'Main St']);

    // "known business, nothing encoded" resolves for a seeded-but-unencoded business
    $pilot = Business::where('name', 'Pilot Business')->first();
    expect($pilot->branches)->toHaveCount(0);

    $this->assertDatabaseHas('activities', [
        'subject_type' => Business::class,
        'subject_id' => $business->id,
        'action' => 'business.seeded',
    ]);
});

test('bulk seeding is idempotent — re-running the same rows does not duplicate businesses or branches', function () {
    $editor = User::factory()->editor()->create();

    $rows = [
        'rows' => [
            ['name' => 'Repeat Corp', 'branch' => 'Rizal St'],
        ],
    ];

    $this->actingAs($editor)->post(route('businesses.bulk-seed'), $rows)->assertRedirect();
    $this->actingAs($editor)->post(route('businesses.bulk-seed'), $rows)->assertRedirect();

    expect(Business::where('name', 'Repeat Corp')->count())->toBe(1);

    $business = Business::where('name', 'Repeat Corp')->first();
    expect($business->branches()->where('location', 'Rizal St')->count())->toBe(1);
});
