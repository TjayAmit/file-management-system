<?php

namespace App\Console\Commands;

use App\Services\DocumentService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('documents:purge-expired')]
#[Description('Purge superseded document versions and soft-deleted documents past the 90-day retention window.')]
class PurgeExpiredRetention extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(DocumentService $documentService): int
    {
        $versionsPurged = $documentService->purgeExpiredVersions();
        $documentsPurged = $documentService->purgeExpiredDocuments();

        $this->info("Purged {$versionsPurged} superseded document version(s) and {$documentsPurged} soft-deleted document(s).");

        return self::SUCCESS;
    }
}
