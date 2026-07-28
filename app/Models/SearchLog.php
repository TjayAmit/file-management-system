<?php

namespace App\Models;

use Database\Factories\SearchLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $query
 * @property int $result_count
 * @property int|null $opened_document_id
 * @property Carbon $created_at
 */
#[Fillable([
    'user_id',
    'query',
    'result_count',
    'opened_document_id',
])]
class SearchLog extends Model
{
    /** @use HasFactory<SearchLogFactory> */
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
            'result_count' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the user who performed the search.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the document opened from search results, if any.
     *
     * @return BelongsTo<Document, $this>
     */
    public function openedDocument(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'opened_document_id');
    }
}
