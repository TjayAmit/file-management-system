import { Form, Head } from '@inertiajs/react';
import {
    Download,
    Eye,
    FileText,
    History,
    MapPin,
    Printer,
    QrCode,
    RotateCcw,
    Trash2,
    Upload,
} from 'lucide-react';
import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import documents from '@/routes/documents';

type Named = { id: number; name: string };

type BranchOption = {
    id: number;
    location: string;
    business?: { id: number; name: string } | null;
};

type VersionItem = {
    id: number;
    original_name: string;
    size: number;
    is_current: boolean;
    created_at: string;
    uploader?: { name: string } | null;
};

type ChangeEntry = {
    id: number;
    field: string;
    old_value: string | null;
    new_value: string | null;
    created_at: string;
    changed_by?: { name: string } | null;
};

type DeletionEntry = {
    id: number;
    reason: string;
    status: string;
    created_at: string;
    requester?: { name: string } | null;
};

type DocumentItem = {
    id: number;
    reference: string;
    title: string | null;
    branch_id: number;
    request_type_id: number;
    storage_location_id: number;
    approval_date: string | null;
    request_date: string | null;
    scan_date: string | null;
    branch?: BranchOption | null;
    request_type?: Named | null;
    storage_location?: Named | null;
    uploader?: { name: string } | null;
    versions?: VersionItem[];
    change_history?: ChangeEntry[];
    deletion_requests?: DeletionEntry[];
};

function fileUrl(reference: string, action: 'view' | 'download' | 'print') {
    return documents.file.url(reference, { query: { action } });
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(0)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function dateOnly(value: string | null): string {
    return value ? value.slice(0, 10) : '—';
}

/**
 * Column names are how the database talks; this is how the office does.
 */
const fieldLabels: Record<string, string> = {
    title: 'Title / subject',
    branch_id: 'Branch',
    request_type_id: 'Request type',
    storage_location_id: 'Physical location',
    approval_date: 'Approval date',
    request_date: 'Request date',
};

function fieldLabel(field: string): string {
    return (
        fieldLabels[field] ??
        field
            .replace(/_id$/, '')
            .replace(/_/g, ' ')
            .replace(/^./, (c) => c.toUpperCase())
    );
}

/**
 * History values arrive as raw column values — a date column reads back as
 * `2026-05-26 00:00:00`, which is noise in a change list.
 */
function historyValue(value: string | null): string {
    if (value === null || value === '') {
        return 'empty';
    }

    const midnightDate = /^(\d{4}-\d{2}-\d{2})[ T]00:00:00/.exec(value);

    return midnightDate ? midnightDate[1] : value;
}

export default function DocumentShow({
    document,
    storageLocations,
    branches,
    requestTypes,
    can,
}: {
    document: DocumentItem;
    storageLocations: Named[];
    branches: BranchOption[];
    requestTypes: Named[];
    can: {
        update: boolean;
        replaceFile: boolean;
        revert: boolean;
        requestDeletion: boolean;
    };
}) {
    const pendingDeletion = document.deletion_requests?.find(
        (entry) => entry.status === 'pending',
    );

    return (
        <>
            <Head title={document.title ?? 'Document'} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title={document.title ?? 'Untitled document'}
                    description={`${document.branch?.business?.name ?? 'Unknown business'} — ${document.branch?.location ?? 'no branch on file'}`}
                    actions={
                        <>
                            <Button asChild variant="outline">
                                <a
                                    href={fileUrl(document.reference, 'view')}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Eye />
                                    View
                                </a>
                            </Button>
                            <Button asChild variant="outline">
                                <a
                                    href={fileUrl(
                                        document.reference,
                                        'download',
                                    )}
                                >
                                    <Download />
                                    Download
                                </a>
                            </Button>
                            <Button asChild variant="outline">
                                <a
                                    href={fileUrl(document.reference, 'print')}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Printer />
                                    Print
                                </a>
                            </Button>
                            <Button asChild>
                                <a
                                    href={documents.qrCode.url(
                                        document.reference,
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <QrCode />
                                    QR code
                                </a>
                            </Button>
                        </>
                    }
                />

                <FlashMessage />

                {pendingDeletion && (
                    <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                        <Trash2 className="mt-0.5 size-4 shrink-0 text-destructive" />
                        <div className="text-sm">
                            <p className="font-medium">
                                Deletion requested — hidden from search while it
                                is decided.
                            </p>
                            <p className="mt-1 text-muted-foreground">
                                {pendingDeletion.reason} —{' '}
                                {pendingDeletion.requester?.name ?? 'someone'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                    <section className="rounded-xl border border-border bg-card">
                        <header className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                <FileText className="size-4" />
                            </span>
                            <h2 className="font-semibold">The metadata card</h2>
                        </header>
                        <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Reference
                                </dt>
                                <dd className="mt-1 font-mono text-sm break-all">
                                    {document.reference}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Request type
                                </dt>
                                <dd className="mt-1 text-sm">
                                    {document.request_type?.name ?? '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Approval date
                                </dt>
                                <dd className="mt-1 text-sm tabular-nums">
                                    {dateOnly(document.approval_date)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Request date
                                </dt>
                                <dd className="mt-1 text-sm tabular-nums">
                                    {dateOnly(document.request_date)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Scanned on
                                </dt>
                                <dd className="mt-1 text-sm tabular-nums">
                                    {dateOnly(document.scan_date)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-muted-foreground">
                                    Encoded by
                                </dt>
                                <dd className="mt-1 text-sm">
                                    {document.uploader?.name ?? 'Unknown'}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-xl border border-border bg-card">
                        <header className="border-b border-border px-5 py-4">
                            <h2 className="font-semibold">Physical location</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Where the paper original is right now.
                            </p>
                        </header>
                        <div className="p-5">
                            <StatusBadge
                                tone="info"
                                icon={<MapPin aria-hidden className="size-3" />}
                            >
                                {document.storage_location?.name ?? 'Unknown'}
                            </StatusBadge>

                            {can.update && (
                                <Form
                                    {...documents.update.form(
                                        document.reference,
                                    )}
                                    className="mt-4 grid gap-2"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <Label htmlFor="storage_location_id">
                                                Move it
                                            </Label>
                                            <NativeSelect
                                                id="storage_location_id"
                                                name="storage_location_id"
                                                defaultValue={
                                                    document.storage_location_id
                                                }
                                            >
                                                {storageLocations.map(
                                                    (location) => (
                                                        <option
                                                            key={location.id}
                                                            value={location.id}
                                                        >
                                                            {location.name}
                                                        </option>
                                                    ),
                                                )}
                                            </NativeSelect>
                                            <InputError
                                                message={
                                                    errors.storage_location_id
                                                }
                                            />
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={processing}
                                                className="justify-self-start"
                                            >
                                                Update location
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            )}
                        </div>
                    </section>
                </div>

                {can.update && (
                    <section className="rounded-xl border border-border bg-card">
                        <header className="border-b border-border px-5 py-4">
                            <h2 className="font-semibold">Correct the card</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Every change is recorded and can be reverted.
                            </p>
                        </header>
                        <Form
                            {...documents.update.form(document.reference)}
                            className="grid gap-4 p-5 sm:grid-cols-2"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-1.5 sm:col-span-2">
                                        <Label htmlFor="title">
                                            Title / subject
                                        </Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            defaultValue={document.title ?? ''}
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="branch_id">
                                            Branch
                                        </Label>
                                        <NativeSelect
                                            id="branch_id"
                                            name="branch_id"
                                            defaultValue={document.branch_id}
                                        >
                                            {branches.map((branch) => (
                                                <option
                                                    key={branch.id}
                                                    value={branch.id}
                                                >
                                                    {branch.business?.name
                                                        ? `${branch.business.name} / ${branch.location}`
                                                        : branch.location}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError
                                            message={errors.branch_id}
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="request_type_id">
                                            Request type
                                        </Label>
                                        <NativeSelect
                                            id="request_type_id"
                                            name="request_type_id"
                                            defaultValue={
                                                document.request_type_id
                                            }
                                        >
                                            {requestTypes.map((type) => (
                                                <option
                                                    key={type.id}
                                                    value={type.id}
                                                >
                                                    {type.name}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError
                                            message={errors.request_type_id}
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="approval_date">
                                            Approval date
                                        </Label>
                                        <Input
                                            id="approval_date"
                                            name="approval_date"
                                            type="date"
                                            defaultValue={
                                                document.approval_date?.slice(
                                                    0,
                                                    10,
                                                ) ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.approval_date}
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="request_date">
                                            Request date
                                        </Label>
                                        <Input
                                            id="request_date"
                                            name="request_date"
                                            type="date"
                                            defaultValue={
                                                document.request_date?.slice(
                                                    0,
                                                    10,
                                                ) ?? ''
                                            }
                                        />
                                        <InputError
                                            message={errors.request_date}
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Save corrections
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </section>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-xl border border-border bg-card">
                        <header className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                <Upload className="size-4" />
                            </span>
                            <div>
                                <h2 className="font-semibold">Scan versions</h2>
                                <p className="text-sm text-muted-foreground">
                                    A replaced scan is superseded, never lost.
                                </p>
                            </div>
                        </header>

                        <ul className="divide-y divide-border">
                            {(document.versions ?? []).map((version) => (
                                <li
                                    key={version.id}
                                    className="flex items-center justify-between gap-3 px-5 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {version.original_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatBytes(version.size)} &middot;{' '}
                                            {version.uploader?.name ??
                                                'Unknown'}
                                        </p>
                                    </div>
                                    {version.is_current ? (
                                        <StatusBadge
                                            tone="success"
                                            className="shrink-0"
                                        >
                                            Current
                                        </StatusBadge>
                                    ) : (
                                        can.update && (
                                            <Form
                                                {...documents.revertFile.form([
                                                    document.reference,
                                                    version.id,
                                                ])}
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={processing}
                                                    >
                                                        <RotateCcw />
                                                        Restore
                                                    </Button>
                                                )}
                                            </Form>
                                        )
                                    )}
                                </li>
                            ))}
                        </ul>

                        {can.replaceFile && (
                            <Form
                                {...documents.replaceFile.form(
                                    document.reference,
                                )}
                                className="grid gap-2 border-t border-border p-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <Label htmlFor="file">
                                            Replace with a better scan
                                        </Label>
                                        <Input
                                            id="file"
                                            name="file"
                                            type="file"
                                            accept="application/pdf"
                                        />
                                        <InputError message={errors.file} />
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={processing}
                                            className="justify-self-start"
                                        >
                                            Upload replacement
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}
                    </section>

                    <section className="rounded-xl border border-border bg-card">
                        <header className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                <History className="size-4" />
                            </span>
                            <h2 className="font-semibold">Change history</h2>
                        </header>

                        {(document.change_history ?? []).length === 0 ? (
                            <p className="px-5 py-6 text-sm text-muted-foreground">
                                Nothing has been corrected on this card yet.
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {(document.change_history ?? []).map(
                                    (entry) => (
                                        <li
                                            key={entry.id}
                                            className="flex items-start justify-between gap-3 px-5 py-3"
                                        >
                                            <div className="min-w-0 text-sm">
                                                <p className="font-medium">
                                                    {fieldLabel(entry.field)}
                                                </p>
                                                <p className="mt-0.5 text-xs break-words text-muted-foreground">
                                                    <span className="line-through decoration-muted-foreground/50">
                                                        {historyValue(
                                                            entry.old_value,
                                                        )}
                                                    </span>{' '}
                                                    &rarr;{' '}
                                                    <span className="text-foreground">
                                                        {historyValue(
                                                            entry.new_value,
                                                        )}
                                                    </span>
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {entry.changed_by?.name ??
                                                        'Unknown'}
                                                </p>
                                            </div>
                                            {can.revert && (
                                                <Form
                                                    {...documents.revert.form([
                                                        document.reference,
                                                        entry.id,
                                                    ])}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <RotateCcw />
                                                            Revert
                                                        </Button>
                                                    )}
                                                </Form>
                                            )}
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </section>
                </div>

                {can.requestDeletion && !pendingDeletion && (
                    <section className="rounded-xl border border-border bg-card">
                        <header className="border-b border-border px-5 py-4">
                            <h2 className="font-semibold">Request deletion</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                An admin decides. The document is hidden from
                                search while the request is open and kept for 90
                                days after approval.
                            </p>
                        </header>
                        <Form
                            {...documents.deletionRequests.store.form(
                                document.reference,
                            )}
                            className="grid gap-2 p-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Label htmlFor="reason">
                                        Why should this be deleted?
                                    </Label>
                                    <Textarea
                                        id="reason"
                                        name="reason"
                                        rows={3}
                                        placeholder="e.g. Duplicate of the scan encoded on 12 March"
                                    />
                                    <InputError message={errors.reason} />
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        size="sm"
                                        disabled={processing}
                                        className="justify-self-start"
                                    >
                                        <Trash2 />
                                        File the request
                                    </Button>
                                </>
                            )}
                        </Form>
                    </section>
                )}
            </div>
        </>
    );
}

DocumentShow.layout = {
    breadcrumbs: [{ title: 'Documents', href: documents.index() }],
};
