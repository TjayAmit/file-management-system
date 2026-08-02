<?php

namespace App\Repositories\Eloquent;

use App\DTOs\CreateTransferData;
use App\Models\Activity;
use App\Models\Document as DocumentModel;
use App\Models\Transfer as TransferModel;
use App\Models\TransferItem;
use App\Repositories\Interface\Transfer as TransferRepositoryInterface;
use Illuminate\Support\Facades\DB;

class EloquentTransfer implements TransferRepositoryInterface
{
    /**
     * Create a transfer batch, moving every referenced document to the target
     * storage location and recording history.
     */
    public function create(CreateTransferData $data): TransferModel
    {
        return DB::transaction(function () use ($data) {
            $documents = DocumentModel::whereIn('reference', $data->references)->get();

            /** @var TransferModel $transfer */
            $transfer = TransferModel::create([
                'to_storage_location_id' => $data->toStorageLocationId,
                'performed_by' => $data->performedBy->id,
                'note' => $data->note,
                'transferred_at' => now(),
            ]);

            foreach ($documents as $document) {
                $fromStorageLocationId = $document->storage_location_id;

                TransferItem::create([
                    'transfer_id' => $transfer->id,
                    'document_id' => $document->id,
                    'from_storage_location_id' => $fromStorageLocationId,
                ]);

                $document->update(['storage_location_id' => $data->toStorageLocationId]);

                Activity::create([
                    'user_id' => $data->performedBy->id,
                    'subject_type' => DocumentModel::class,
                    'subject_id' => $document->id,
                    'action' => 'document.transferred',
                    'details' => [
                        'transfer_id' => $transfer->id,
                        'from_storage_location_id' => $fromStorageLocationId,
                        'to_storage_location_id' => $data->toStorageLocationId,
                    ],
                ]);
            }

            /** @var TransferModel */
            return $transfer->load(['items.document', 'targetLocation', 'performer']);
        });
    }
}
