<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use Database\Seeders\StorageLocationSeeder;

test('seeder populates initial storage locations', function () {
    $this->seed(StorageLocationSeeder::class);

    $this->assertDatabaseHas('storage_locations', ['name' => 'In Office']);
    $this->assertDatabaseHas('storage_locations', ['name' => 'Central Storage Building']);
});

test('documents reference storage location id', function () {
    $storage = StorageLocation::factory()->create(['name' => 'Archive Vault 3']);
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();

    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
        'storage_location_id' => $storage->id,
    ]);

    expect($document->storageLocation->id)->toBe($storage->id);
    expect($document->storageLocation->name)->toBe('Archive Vault 3');
});

test('admin can create and update storage locations but non-admin is denied', function () {
    $admin = User::factory()->admin()->create();
    $editor = User::factory()->editor()->create();

    // Editor denied
    $this->actingAs($editor)
        ->post(route('admin.storage-locations.store'), ['name' => 'Offsite Annex'])
        ->assertStatus(403);

    // Admin allowed
    $this->actingAs($admin)
        ->post(route('admin.storage-locations.store'), ['name' => 'Offsite Annex'])
        ->assertRedirect();

    $this->assertDatabaseHas('storage_locations', ['name' => 'Offsite Annex']);

    $location = StorageLocation::where('name', 'Offsite Annex')->first();

    $this->actingAs($admin)
        ->patch(route('admin.storage-locations.update', $location), ['name' => 'Offsite Annex B'])
        ->assertRedirect();

    $this->assertDatabaseHas('storage_locations', ['id' => $location->id, 'name' => 'Offsite Annex B']);
});
