<?php

namespace App\DTOs;

use App\Models\User;
use Illuminate\Http\UploadedFile;

final readonly class ReplaceDocumentFileData
{
    public function __construct(
        public UploadedFile $file,
        public User $user,
    ) {}
}
