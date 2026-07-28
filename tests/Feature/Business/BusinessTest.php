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
