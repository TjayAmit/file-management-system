<?php

namespace App\Models;

use Database\Factories\ChangeHistoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $document_id
 * @property string $field
 * @property string|null $old_value
 * @property string|null $new_value
 * @property int|null $changed_by
 * @property bool $is_revert
 * @property Carbon $created_at
 */
#[Fillable([
    'document_id',
    'field',
    'old_value',
    'new_value',
    'changed_by',
    'is_revert',
])]
class ChangeHistory extends Model
{
    /** @use HasFactory<ChangeHistoryFactory> */
    use HasFactory;

    public $timestamps = false;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_revert' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the document for this change history entry.
     *
     * @return BelongsTo<Document, $this>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    /**
     * Get the user who made the change.
     *
     * @return BelongsTo<User, $this>
     */
    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
