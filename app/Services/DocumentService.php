<?php

namespace App\Services;

use App\DTOs\CreateDocumentData;
use App\DTOs\ReplaceDocumentFileData;
use App\DTOs\RequestDeletionData;
use App\DTOs\UpdateDocumentData;
use App\Models\AccessLog;
use App\Models\ChangeHistory;
use App\Models\DeletionRequest;
use App\Models\Document as DocumentModel;
use App\Models\DocumentVersion;
use App\Models\User;
use App\Repositories\Interface\Document as DocumentRepositoryInterface;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\SvgWriter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentService
{
    public function __construct(
        private readonly DocumentRepositoryInterface $documentRepository,
    ) {}

    /**
     * Get all documents.
     *
     * @return Collection<int, DocumentModel>
     */
    public function getAllDocuments(): Collection
    {
        return $this->documentRepository->all();
    }

    /**
     * Paginate documents for the archive browser.
     *
     * @param  array{query: string, branch_id: int|null, request_type_id: int|null, storage_location_id: int|null}  $filters
     * @return LengthAwarePaginator<int, DocumentModel>
     */
    public function paginateDocuments(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->documentRepository->paginateFiltered($filters, $perPage);
    }

    /**
     * Every deletion request, pending ones first.
     *
     * @return Collection<int, DeletionRequest>
     */
    public function getDeletionRequests(): Collection
    {
        return $this->documentRepository->deletionRequests();
    }

    /**
     * Counts for the dashboard tiles.
     *
     * @return array{documents: int, businesses: int, branches: int, request_types: int, pending_deletions: int, encoded_this_month: int, by_storage_location: array<int, array{name: string, total: int}>}
     */
    public function getDashboardStatistics(): array
    {
        return $this->documentRepository->dashboardStatistics();
    }

    /**
     * Find document by internal ID.
     */
    public function getDocumentById(int $id): ?DocumentModel
    {
        return $this->documentRepository->findById($id);
    }

    /**
     * Find document by opaque reference.
     */
    public function getDocumentByReference(string $reference): ?DocumentModel
    {
        return $this->documentRepository->findByReference($reference);
    }

    /**
     * Create a new document with uploaded PDF.
     */
    public function createDocument(CreateDocumentData $data): DocumentModel
    {
        return $this->documentRepository->create($data);
    }

    /**
     * Update document metadata and track changes.
     */
    public function updateDocument(DocumentModel $document, UpdateDocumentData $data): DocumentModel
    {
        return $this->documentRepository->update($document, $data);
    }

    /**
     * Revert a specific change history entry.
     */
    public function revertDocument(DocumentModel $document, ChangeHistory $changeHistory, User $user): DocumentModel
    {
        return $this->documentRepository->revert($document, $changeHistory, $user);
    }

    /**
     * Replace document file scan.
     */
    public function replaceDocumentFile(DocumentModel $document, ReplaceDocumentFileData $data): DocumentModel
    {
        return $this->documentRepository->replaceFile($document, $data);
    }

    /**
     * Revert document to a previous file version.
     */
    public function revertDocumentFileVersion(DocumentModel $document, DocumentVersion $version, User $user): DocumentModel
    {
        return $this->documentRepository->revertFileVersion($document, $version, $user);
    }

    /**
     * Serve the document's current PDF file, recording an access log entry.
     */
    public function serveDocument(DocumentModel $document, string $action, User $user): StreamedResponse
    {
        $version = $document->currentVersion;

        if (! $version) {
            abort(404, 'No file version available for this document.');
        }

        $this->documentRepository->logAccess($document, $user, $action);

        $disk = Storage::disk('private');

        if ($action === 'download') {
            return $disk->download($version->path, $version->original_name);
        }

        return $disk->response($version->path, $version->original_name, [
            'Content-Type' => $version->mime_type,
        ]);
    }

    /**
     * File a deletion request for a document, hiding it from search while pending.
     */
    public function requestDeletion(DocumentModel $document, RequestDeletionData $data): DeletionRequest
    {
        return $this->documentRepository->requestDeletion($document, $data);
    }

    /**
     * Approve a pending deletion request, soft-deleting the document.
     */
    public function approveDeletion(DeletionRequest $deletionRequest, User $user): DeletionRequest
    {
        return $this->documentRepository->approveDeletion($deletionRequest, $user);
    }

    /**
     * Reject a pending deletion request, restoring the document to search.
     */
    public function rejectDeletion(DeletionRequest $deletionRequest, User $user): DeletionRequest
    {
        return $this->documentRepository->rejectDeletion($deletionRequest, $user);
    }

    /**
     * Purge superseded document versions older than the retention window.
     */
    public function purgeExpiredVersions(int $retentionDays = 90): int
    {
        return $this->documentRepository->purgeExpiredVersions($retentionDays);
    }

    /**
     * Purge soft-deleted documents older than the retention window.
     */
    public function purgeExpiredDocuments(int $retentionDays = 90): int
    {
        return $this->documentRepository->purgeExpiredDocuments($retentionDays);
    }

    /**
     * Generate a printable QR code (SVG) encoding the document's opaque reference.
     *
     * The QR encodes the bare reference token only — never a URL or the
     * internal integer id — so scanning it discloses nothing without the
     * authenticated app (PLAN.md §3.4, §6.9).
     */
    public function generateQrCodeSvg(DocumentModel $document): string
    {
        $result = (new Builder(writer: new SvgWriter))->build(
            data: $document->reference,
            size: 300,
            margin: 10,
        );

        return $result->getString();
    }

    /**
     * The print-ready label sheet for a stack of documents (PLAN.md §3.4).
     *
     * A QR code is only useful once it is stuck to the paper, so the sheet
     * carries the human-readable card beside each code: a clerk holding a
     * cut label must be able to tell which document it belongs to without
     * scanning anything.
     *
     * @param  array<int, string>  $references
     * @return array<int, array{reference: string, title: string|null, business: string, branch: string, request_type: string, storage_location: string, main_date: string|null, qr: string}>
     */
    public function getQrLabels(array $references): array
    {
        return $this->documentRepository->findManyByReference($references)
            ->map(fn (DocumentModel $document): array => [
                'reference' => $document->reference,
                'title' => $document->title,
                'business' => $document->branch->business->name,
                'branch' => $document->branch->location,
                'request_type' => $document->requestType->name,
                'storage_location' => $document->storageLocation->name,
                'main_date' => ($document->approval_date ?? $document->request_date)?->toDateString(),
                'qr' => $this->inlineQrCodeSvg($document),
            ])
            ->all();
    }

    /**
     * Paginate access-log entries for the admin review page (PLAN.md §6.6).
     *
     * @param  array{action: string|null, user_id: int|null, reference: string|null}  $filters
     * @return LengthAwarePaginator<int, AccessLog>
     */
    public function paginateAccessLogs(array $filters, int $perPage = 50): LengthAwarePaginator
    {
        return $this->documentRepository->paginateAccessLogs($filters, $perPage);
    }

    /**
     * Who has opened one document, newest first.
     *
     * @return Collection<int, AccessLog>
     */
    public function getAccessLogsFor(DocumentModel $document, int $limit = 25): Collection
    {
        return $this->documentRepository->accessLogsFor($document, $limit);
    }

    /**
     * The QR code as an SVG fragment that can be embedded in a page.
     *
     * The writer emits a standalone document with an XML prolog; that prolog
     * is invalid inside HTML, so it is dropped here rather than in the view.
     */
    private function inlineQrCodeSvg(DocumentModel $document): string
    {
        return trim(preg_replace('/^<\?xml[^>]*\?>\s*/', '', $this->generateQrCodeSvg($document)) ?? '');
    }
}
