<?php

use App\Models\AccessLog;
use App\Models\Activity;
use App\Models\Branch;
use App\Models\Business;
use App\Models\ChangeHistory;
use App\Models\DeletionRequest;
use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\RequestType;
use App\Models\SearchLog;
use App\Models\StorageLocation;
use App\Models\Transfer;
use App\Models\TransferItem;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

test('users table has role and is_active columns and helper methods', function () {
    expect(Schema::hasColumn('users', 'role'))->toBeTrue();
    expect(Schema::hasColumn('users', 'is_active'))->toBeTrue();

    $admin = User::factory()->admin()->create();
    $editor = User::factory()->editor()->create();
    $viewer = User::factory()->viewer()->create();
    $inactive = User::factory()->inactive()->create();

    expect($admin->isAdmin())->toBeTrue();
    expect($editor->isEditor())->toBeTrue();
    expect($viewer->isViewer())->toBeTrue();
    expect($inactive->is_active)->toBeFalse();
});

test('document hierarchy links branch to business without business_id on document', function () {
    expect(Schema::hasColumn('documents', 'business_id'))->toBeFalse();

    $business = Business::factory()->create(['name' => 'Acme Corp']);
    $branch = Branch::factory()->create(['business_id' => $business->id, 'location' => 'Rizal St']);
    $document = Document::factory()->create(['branch_id' => $branch->id]);

    expect($document->branch->id)->toBe($branch->id);
    expect($document->branch->business->id)->toBe($business->id);
    expect($document->branch->business->name)->toBe('Acme Corp');
});

test('soft deletes work on business, branch, request_type, and document', function () {
    $business = Business::factory()->create();
    $branch = Branch::factory()->create(['business_id' => $business->id]);
    $requestType = RequestType::factory()->create();
    $document = Document::factory()->create([
        'branch_id' => $branch->id,
        'request_type_id' => $requestType->id,
    ]);

    $document->delete();
    expect($document->trashed())->toBeTrue();
    expect(Document::find($document->id))->toBeNull();
    expect(Document::withTrashed()->find($document->id))->not->toBeNull();

    $branch->delete();
    expect($branch->trashed())->toBeTrue();

    $business->delete();
    expect($business->trashed())->toBeTrue();

    $requestType->delete();
    expect($requestType->trashed())->toBeTrue();
});

test('document versions and change histories function properly', function () {
    $document = Document::factory()->create();
    $version = DocumentVersion::factory()->create([
        'document_id' => $document->id,
        'is_current' => true,
    ]);
    $history = ChangeHistory::factory()->create([
        'document_id' => $document->id,
        'field' => 'title',
        'old_value' => 'Old Title',
        'new_value' => 'New Title',
    ]);

    expect($document->versions)->toHaveCount(1);
    expect($document->currentVersion->id)->toBe($version->id);
    expect($document->changeHistory)->toHaveCount(1);
    expect($document->changeHistory->first()->field)->toBe('title');
});

test('deletion request workflow models function properly', function () {
    $document = Document::factory()->create();
    $requester = User::factory()->create();
    $approver = User::factory()->admin()->create();

    $request = DeletionRequest::factory()->create([
        'document_id' => $document->id,
        'requested_by' => $requester->id,
        'status' => 'pending',
    ]);

    expect($request->document->id)->toBe($document->id);
    expect($request->requester->id)->toBe($requester->id);

    $request->update([
        'status' => 'approved',
        'approved_by' => $approver->id,
        'decided_at' => now(),
    ]);

    expect($request->fresh()->approver->id)->toBe($approver->id);
    expect($request->fresh()->status)->toBe('approved');
});

test('transfer and transfer items model relationships work', function () {
    $locationFrom = StorageLocation::factory()->create(['name' => 'In Office']);
    $locationTo = StorageLocation::factory()->create(['name' => 'Central Storage Building']);
    $performer = User::factory()->editor()->create();
    $document = Document::factory()->create(['storage_location_id' => $locationFrom->id]);

    $transfer = Transfer::factory()->create([
        'to_storage_location_id' => $locationTo->id,
        'performed_by' => $performer->id,
    ]);

    $item = TransferItem::factory()->create([
        'transfer_id' => $transfer->id,
        'document_id' => $document->id,
        'from_storage_location_id' => $locationFrom->id,
    ]);

    expect($transfer->items)->toHaveCount(1);
    expect($item->transfer->id)->toBe($transfer->id);
    expect($item->document->id)->toBe($document->id);
    expect($item->fromStorageLocation->id)->toBe($locationFrom->id);
    expect($transfer->targetLocation->id)->toBe($locationTo->id);
});

test('polymorphic activity logging and search/access logs work', function () {
    $user = User::factory()->create();
    $document = Document::factory()->create();

    $activity = Activity::factory()->create([
        'user_id' => $user->id,
        'subject_type' => Document::class,
        'subject_id' => $document->id,
        'action' => 'document.uploaded',
    ]);

    expect($activity->user->id)->toBe($user->id);
    expect($activity->subject->id)->toBe($document->id);

    $accessLog = AccessLog::factory()->create([
        'user_id' => $user->id,
        'document_id' => $document->id,
        'action' => 'view',
    ]);

    expect($accessLog->user->id)->toBe($user->id);
    expect($accessLog->document->id)->toBe($document->id);

    $searchLog = SearchLog::factory()->create([
        'user_id' => $user->id,
        'query' => 'McDonalds',
        'result_count' => 5,
        'opened_document_id' => $document->id,
    ]);

    expect($searchLog->openedDocument->id)->toBe($document->id);
});
