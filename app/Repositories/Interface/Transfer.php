<?php

namespace App\Repositories\Interface;

use App\DTOs\CreateTransferData;
use App\Models\Transfer as TransferModel;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface Transfer
{
    /**
     * Create a transfer batch, moving every referenced document to the target
     * storage location and recording history. A single-document transfer is
     * simply a batch with one item (SCHEMA.md "Physical transfers").
     */
    public function create(CreateTransferData $data): TransferModel;

    /**
     * Paginate transfer batches, most recent first.
     *
     * @return LengthAwarePaginator<int, TransferModel>
     */
    public function paginate(int $perPage): LengthAwarePaginator;
}
