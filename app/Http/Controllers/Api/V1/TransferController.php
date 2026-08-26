<?php

namespace App\Http\Controllers\Api\V1;

use App\DTOs\CreateTransferData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Transfer\StoreTransferRequest;
use App\Services\TransferService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

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
    public function store(StoreTransferRequest $request): JsonResponse
    {
        $data = new CreateTransferData(
            references: $request->references(),
            toStorageLocationId: (int) $request->validated('to_storage_location_id'),
            note: $request->validated('note') !== null ? (string) $request->validated('note') : null,
            performedBy: $request->user(),
        );

        $transfer = $this->transferService->createTransfer($data);

        return $this->successResponse($transfer, 'Transfer completed successfully', 201);
    }
}
