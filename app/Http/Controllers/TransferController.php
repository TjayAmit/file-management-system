<?php

namespace App\Http\Controllers;

use App\DTOs\CreateTransferData;
use App\Http\Requests\Transfer\StoreTransferRequest;
use App\Models\Transfer;
use App\Services\DocumentService;
use App\Services\StorageLocationService;
use App\Services\TransferService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class TransferController extends Controller
{
    public function __construct(
        private readonly TransferService $transferService,
        private readonly StorageLocationService $storageLocationService,
        private readonly DocumentService $documentService,
    ) {}

    /**
     * Display recent transfer batches and the form for staging a new one.
     */
    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', Transfer::class);

        return Inertia::render('transfers/index', [
            'transfers' => $this->transferService->paginateTransfers(),
            'storageLocations' => $this->storageLocationService->getAllStorageLocations(),
            'documents' => $this->documentService->getAllDocuments(),
            'can' => [
                'transfer' => $request->user()?->can('create', Transfer::class) ?? false,
            ],
        ]);
    }

    /**
     * Create a transfer batch, moving the referenced documents to a new
     * storage location. A single-document transfer is a batch of one.
     */
    public function store(StoreTransferRequest $request): RedirectResponse
    {
        $data = new CreateTransferData(
            references: $request->references(),
            toStorageLocationId: (int) $request->validated('to_storage_location_id'),
            note: $request->validated('note') !== null ? (string) $request->validated('note') : null,
            performedBy: $request->user(),
        );

        $this->transferService->createTransfer($data);

        return back()->with('status', 'Transfer completed successfully');
    }
}
