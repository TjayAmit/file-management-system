<?php

namespace App\Http\Controllers;

use App\DTOs\CreateTransferData;
use App\Services\TransferService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    public function __construct(
        private readonly TransferService $transferService,
    ) {}

    /**
     * Create a transfer batch, moving the referenced documents to a new
     * storage location. A single-document transfer is a batch of one.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'references' => ['required', 'array', 'min:1'],
            'references.*' => ['string', 'exists:documents,reference'],
            'to_storage_location_id' => ['required', 'integer', 'exists:storage_locations,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $data = new CreateTransferData(
            references: $validated['references'],
            toStorageLocationId: (int) $validated['to_storage_location_id'],
            note: isset($validated['note']) ? (string) $validated['note'] : null,
            performedBy: $request->user(),
        );

        $this->transferService->createTransfer($data);

        return back()->with('status', 'Transfer completed successfully');
    }
}
