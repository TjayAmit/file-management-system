<?php

namespace App\Services;

use App\DTOs\CreateTransferData;
use App\Models\Transfer as TransferModel;
use App\Repositories\Interface\Transfer as TransferRepositoryInterface;

class TransferService
{
    public function __construct(
        private readonly TransferRepositoryInterface $transferRepository,
    ) {}

    /**
     * Create a transfer batch (or single-document transfer, a batch of one).
     */
    public function createTransfer(CreateTransferData $data): TransferModel
    {
        return $this->transferRepository->create($data);
    }
}
