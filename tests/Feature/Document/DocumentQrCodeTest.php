<?php

use App\Models\Branch;
use App\Models\Business;
use App\Models\Document;
use App\Models\RequestType;
use App\Models\StorageLocation;
use App\Models\User;
use App\Services\DocumentService;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\SvgWriter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

function uploadDocumentForQrCode(User $editor): Document
{
    $branch = Branch::factory()->create(['business_id' => Business::factory()->create()->id]);
    $requestType = RequestType::factory()->create();
    $storage = StorageLocation::factory()->create();

    $file = UploadedFile::fake()->create('scan.pdf', 100, 'application/pdf');

    test()->actingAs($editor)
        ->post(route('documents.store'), [
            'branch_id' => $branch->id,
            'request_type_id' => $requestType->id,
            'storage_location_id' => $storage->id,
            'title' => 'QR Doc',
            'document_date' => '2026-07-28',
            'file' => $file,
        ]);

    return Document::where('title', 'QR Doc')->firstOrFail();
}

test('requesting the qr code requires authentication', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $document = uploadDocumentForQrCode($editor);

    Auth::logout();

    $response = $this->get(route('documents.qr-code', $document->reference));

    $response->assertRedirect(route('login'));
});

test('any authenticated role can fetch the printable qr code as an inline svg', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $document = uploadDocumentForQrCode($editor);

    $viewer = User::factory()->viewer()->create();

    $response = $this->actingAs($viewer)
        ->get(route('documents.qr-code', $document->reference));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'image/svg+xml');
    expect($response->getContent())->toContain('<svg');
});

test('an unknown reference returns not found', function () {
    $viewer = User::factory()->viewer()->create();

    $response = $this->actingAs($viewer)
        ->get(route('documents.qr-code', 'does-not-exist'));

    $response->assertNotFound();
});

test('the qr code encodes exactly the opaque reference and nothing else', function () {
    Storage::fake('private');

    $editor = User::factory()->editor()->create();
    $document = uploadDocumentForQrCode($editor);

    $svg = app(DocumentService::class)->generateQrCodeSvg($document);

    $expected = (new Builder(writer: new SvgWriter))->build(
        data: $document->reference,
        size: 300,
        margin: 10,
    )->getString();

    expect($svg)->toBe($expected);
});
