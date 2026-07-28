<?php

namespace App\Models;

use Database\Factories\TransferFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $to_storage_location_id
 * @property int $performed_by
 * @property string|null $note
 * @property Carbon $transferred_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'to_storage_location_id',
    'performed_by',
    'note',
    'transferred_at',
])]
class Transfer extends Model
{
    /** @use HasFactory<TransferFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'transferred_at' => 'datetime',
        ];
    }

    /**
     * Get the target storage location.
     *
     * @return BelongsTo<StorageLocation, $this>
     */
    public function targetLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class, 'to_storage_location_id');
    }

    /**
     * Get the user who performed the transfer.
     *
     * @return BelongsTo<User, $this>
     */
    public function performer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Get the items in this transfer.
     *
     * @return HasMany<TransferItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(TransferItem::class);
    }
}
