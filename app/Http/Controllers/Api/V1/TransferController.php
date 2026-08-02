<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateTransferData;
use App\Http\Controllers\Controller;
use App\Services\TransferService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly TransferService $transferService,
    ) {}

    /**
     * Create a transfer batch, moving the referenced documents to a new
     * storage location. A single-document transfer is a batch of one.
     */
    public function store(Request $request): JsonResponse
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

        $transfer = $this->transferService->createTransfer($data);

        return $this->successResponse($transfer, 'Transfer completed successfully', 201);
    }
}
