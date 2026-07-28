<?php

use App\Models\Activity;
use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;

test('branch suggestion filters by business id and location query', function () {
    $user = User::factory()->viewer()->create();

    $biz1 = Business::factory()->create(['name' => 'Biz One']);
    $biz2 = Business::factory()->create(['name' => 'Biz Two']);

    Branch::factory()->create(['business_id' => $biz1->id, 'location' => 'Downtown Manila']);
    Branch::factory()->create(['business_id' => $biz1->id, 'location' => 'Uptown BGC']);
    Branch::factory()->create(['business_id' => $biz2->id, 'location' => 'Downtown Cebu']);

    $response = $this->actingAs($user)
        ->getJson(route('api.v1.branches.index', ['business_id' => $biz1->id, 'query' => 'Down']));

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.location', 'Downtown Manila');
});

test('branch creation and update allowed for editor', function () {
    $editor = User::factory()->editor()->create();
    $biz = Business::factory()->create();

    $response = $this->actingAs($editor)
        ->post(route('branches.store'), [
            'business_id' => $biz->id,
            'location' => 'Makati Avenue',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('branches', ['business_id' => $biz->id, 'location' => 'Makati Avenue']);

    $branch = Branch::where('location', 'Makati Avenue')->first();

    $this->actingAs($editor)
        ->patch(route('branches.update', $branch), [
            'location' => 'Ayala Center',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('branches', ['id' => $branch->id, 'location' => 'Ayala Center']);
});

test('re-parenting a branch moves it to new business and documents follow', function () {
    $editor = User::factory()->editor()->create();

    $biz1 = Business::factory()->create(['name' => 'Source Business']);
    $biz2 = Business::factory()->create(['name' => 'Target Business']);

    $branch = Branch::factory()->create(['business_id' => $biz1->id, 'location' => 'Ortigas Center']);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $doc = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $storage->id,
    ]);

    $response = $this->actingAs($editor)
        ->post(route('branches.reparent', $branch), [
            'new_business_id' => $biz2->id,
        ]);

    $response->assertRedirect();

    // Branch business_id updated
    expect($branch->fresh()->business_id)->toBe($biz2->id);

    // Document remains linked to branch (and now belongs to biz2 via branch)
    expect($doc->fresh()->branch_id)->toBe($branch->id);
    expect($doc->fresh()->branch->business_id)->toBe($biz2->id);

    // Activity logged
    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Branch::class,
        'subject_id' => $branch->id,
        'action' => 'branch.reparented',
    ]);
});

test('re-parent collision merges duplicate branch, re-points documents, soft deletes source, and logs activity', function () {
    $editor = User::factory()->editor()->create();

    $biz1 = Business::factory()->create(['name' => 'Old Company']);
    $biz2 = Business::factory()->create(['name' => 'New Company']);

    // Both businesses have a branch at "Subic Port"
    $sourceBranch = Branch::factory()->create(['business_id' => $biz1->id, 'location' => 'Subic Port']);
    $targetBranch = Branch::factory()->create(['business_id' => $biz2->id, 'location' => 'Subic Port']);

    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $doc = Document::factory()->create([
        'branch_id' => $sourceBranch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $storage->id,
    ]);

    // Re-parent sourceBranch to biz2 where targetBranch already exists at same location
    $response = $this->actingAs($editor)
        ->post(route('branches.reparent', $sourceBranch), [
            'new_business_id' => $biz2->id,
        ]);

    $response->assertRedirect();

    // Document re-pointed to targetBranch
    expect($doc->fresh()->branch_id)->toBe($targetBranch->id);

    // Source branch soft deleted
    expect($sourceBranch->fresh()->trashed())->toBeTrue();

    // Activity logged
    $this->assertDatabaseHas('activities', [
        'user_id' => $editor->id,
        'subject_type' => Branch::class,
        'subject_id' => $targetBranch->id,
        'action' => 'branch.merged',
    ]);
});
