<?php

namespace App\Models;

use Database\Factories\TransferItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $transfer_id
 * @property int $document_id
 * @property int|null $from_storage_location_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'transfer_id',
    'document_id',
    'from_storage_location_id',
])]
class TransferItem extends Model
{
    /** @use HasFactory<TransferItemFactory> */
    use HasFactory;

    /**
     * Get the transfer batch.
     *
     * @return BelongsTo<Transfer, $this>
     */
    public function transfer(): BelongsTo
    {
        return $this->belongsTo(Transfer::class);
    }

    /**
     * Get the document being transferred.
     *
     * @return BelongsTo<Document, $this>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the origin storage location.
     *
     * @return BelongsTo<StorageLocation, $this>
     */
    public function fromStorageLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class, 'from_storage_location_id');
    }
}
