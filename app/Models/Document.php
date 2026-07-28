<?php

namespace App\Models;

use Database\Factories\DocumentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $reference
 * @property int $branch_id
 * @property int $request_type_id
 * @property int $storage_location_id
 * @property Carbon|null $approval_date
 * @property Carbon|null $request_date
 * @property string|null $title
 * @property Carbon $scan_date
 * @property int|null $uploaded_by
 * @property bool $is_hidden
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable([
    'reference',
    'branch_id',
    'request_type_id',
    'storage_location_id',
    'approval_date',
    'request_date',
    'title',
    'scan_date',
    'uploaded_by',
    'is_hidden',
])]
class Document extends Model
{
    /** @use HasFactory<DocumentFactory> */
    use HasFactory, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'approval_date' => 'date',
            'request_date' => 'date',
            'scan_date' => 'datetime',
            'is_hidden' => 'boolean',
        ];
    }

    /**
     * Get the branch that owns the document.
     *
     * @return BelongsTo<Branch, $this>
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the request type for the document.
     *
     * @return BelongsTo<RequestType, $this>
     */
    public function requestType(): BelongsTo
    {
        return $this->belongsTo(RequestType::class);
    }

    /**
     * Get the storage location for the document.
     *
     * @return BelongsTo<StorageLocation, $this>
     */
    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class);
    }

    /**
     * Get the user who uploaded the document.
     *
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the file versions for the document.
     *
     * @return HasMany<DocumentVersion, $this>
     */
    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class);
    }

    /**
     * Get the current file version for the document.
     *
     * @return HasOne<DocumentVersion, $this>
     */
    public function currentVersion(): HasOne
    {
        return $this->hasOne(DocumentVersion::class)->where('is_current', true);
    }

    /**
     * Get the change history entries for the document.
     *
     * @return HasMany<ChangeHistory, $this>
     */
    public function changeHistory(): HasMany
    {
        return $this->hasMany(ChangeHistory::class);
    }

    /**
     * Alias for change history entries.
     *
     * @return HasMany<ChangeHistory, $this>
     */
    public function changeHistories(): HasMany
    {
        return $this->hasMany(ChangeHistory::class);
    }

    /**
     * Get the deletion requests for the document.
     *
     * @return HasMany<DeletionRequest, $this>
     */
    public function deletionRequests(): HasMany
    {
        return $this->hasMany(DeletionRequest::class);
    }

    /**
     * Get the access logs for the document.
     *
     * @return HasMany<AccessLog, $this>
     */
    public function accessLogs(): HasMany
    {
        return $this->hasMany(AccessLog::class);
    }
}
