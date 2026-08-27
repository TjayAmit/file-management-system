import { Form, Head, Link } from '@inertiajs/react';
import {
    Building2,
    Copy,
    Download,
    Eye,
    FileEdit,
    FileText,
    History,
    MapPin,
    Printer,
    QrCode,
    RotateCcw,
    ShieldAlert,
    Trash2,
    Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import Callout from '@/components/callout';
import ConfirmDialog from '@/components/confirm-dialog';
import FormDialog from '@/components/form-dialog';
import FormField from '@/components/form-field';
import PageContainer from '@/components/page-container';
import {
    SectionCard,
    SectionCardBody,
    SectionCardHeader,
} from '@/components/section-card';
import type { StatusTone } from '@/components/status-badge';
import StatusBadge from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import admin from '@/routes/admin';
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

type AccessEntry = {
    id: number;
    action: 'view' | 'download' | 'print';
    created_at: string;
    user?: { name: string } | null;
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
            .replace(/^./, (character) => character.toUpperCase())
    );
}

function historyValue(value: string | null): string {
    if (value === null || value === '') {
        return 'empty';
    }

    const midnightDate = /^(\d{4}-\d{2}-\d{2})[ T]00:00:00/.exec(value);

    return midnightDate ? midnightDate[1] : value;
}

const accessToneByAction: Record<AccessEntry['action'], StatusTone> = {
    view: 'info',
    download: 'warning',
    print: 'neutral',
};

function accessTimestamp(value: string): string {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleString(undefined, {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function MetaCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-3">
            <dt className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {label}
            </dt>
            <dd className="mt-1 truncate text-sm font-medium text-foreground tabular-nums">
                {value}
            </dd>
        </div>
    );
}

export default function DocumentShow({
    document,
    storageLocations,
    branches,
    requestTypes,
    accessLogs,
    can,
}: {
    document: DocumentItem;
    storageLocations: Named[];
    branches: BranchOption[];
    requestTypes: Named[];
    accessLogs: AccessEntry[] | null;
    can: {
        update: boolean;
        replaceFile: boolean;
        revert: boolean;
        requestDeletion: boolean;
        viewAccessLog: boolean;
        printLabel: boolean;
    };
}) {
    const pendingDeletion = document.deletion_requests?.find(
        (entry) => entry.status === 'pending',
    );

    const versions = document.versions ?? [];
    const changeHistory = document.change_history ?? [];
    const access = accessLogs ?? [];

    function copyReference() {
        navigator.clipboard
            .writeText(document.reference)
            .then(() => toast.success('Reference copied to clipboard'))
            .catch(() => toast.error('Could not reach the clipboard'));
    }

    return (
        <>
            <Head title={document.title ?? 'Document Details'} />
            <PageContainer>
                <div className="animate-rise flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                                {document.reference}
                                <button
                                    type="button"
                                    onClick={copyReference}
                                    aria-label="Copy reference code"
                                    title="Copy reference code"
                                    className="ml-0.5 rounded p-0.5 text-primary/70 transition-colors hover:text-primary"
                                >
                                    <Copy className="size-3" />
                                </button>
                            </span>
                            <StatusBadge
                                tone="info"
                                icon={<MapPin className="size-3" />}
                            >
                                {document.storage_location?.name ??
                                    'Unknown location'}
                            </StatusBadge>
                            {document.request_type && (
                                <Badge
                                    variant="secondary"
                                    className="rounded-full"
                                >
                                    {document.request_type.name}
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl">
                            {document.title ?? 'Untitled document'}
                        </h1>

                        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="size-4 shrink-0" />
                            <span>
                                {document.branch?.business?.name ??
                                    'Unknown business'}
                            </span>
                            <span aria-hidden>·</span>
                            <span>
                                {document.branch?.location ??
                                    'No branch on file'}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <Button asChild variant="outline" size="sm">
                            <a
                                href={fileUrl(document.reference, 'view')}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Eye className="size-3.5" />
                                View PDF
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <a href={fileUrl(document.reference, 'download')}>
                                <Download className="size-3.5" />
                                Download
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <a
                                href={fileUrl(document.reference, 'print')}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Printer className="size-3.5" />
                                Print
                            </a>
                        </Button>
                        {can.printLabel && (
                            <Button asChild size="sm">
                                <Link
                                    href={documents.qrLabels.url({
                                        query: {
                                            references: [document.reference],
                                        },
                                    })}
                                >
                                    <QrCode className="size-3.5" />
                                    QR label
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {pendingDeletion && (
                    <Callout
                        tone="danger"
                        icon={ShieldAlert}
                        title="Deletion requested — hidden from general search"
                    >
                        <span className="font-medium text-foreground">
                            &ldquo;{pendingDeletion.reason}&rdquo;
                        </span>{' '}
                        — filed by{' '}
                        {pendingDeletion.requester?.name ?? 'a staff member'} on{' '}
                        {dateOnly(pendingDeletion.created_at)}. An administrator
                        decides from the deletion queue.
                    </Callout>
                )}

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="flex min-w-0 flex-col gap-6">
                        <SectionCard>
                            <SectionCardHeader
                                title="Metadata index card"
                                description="The only route back to this document once the paper is filed."
                                icon={FileText}
                                actions={
                                    can.update && (
                                        <FormDialog
                                            trigger={
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <FileEdit className="size-3.5" />
                                                    Correct metadata
                                                </Button>
                                            }
                                            title="Correct metadata index"
                                            description="Every correction is versioned into the change history below and can be reverted from there."
                                            icon={FileEdit}
                                            form={documents.update.form(
                                                document.reference,
                                            )}
                                            submitLabel="Save corrections"
                                            size="lg"
                                        >
                                            {({ errors }) => (
                                                <>
                                                    <FormField
                                                        label="Document title or subject"
                                                        error={errors.title}
                                                    >
                                                        {({
                                                            id,
                                                            describedBy,
                                                            invalid,
                                                        }) => (
                                                            <Input
                                                                id={id}
                                                                name="title"
                                                                autoFocus
                                                                defaultValue={
                                                                    document.title ??
                                                                    ''
                                                                }
                                                                aria-describedby={
                                                                    describedBy
                                                                }
                                                                aria-invalid={
                                                                    invalid
                                                                }
                                                                className="bg-card"
                                                            />
                                                        )}
                                                    </FormField>

                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <FormField
                                                            label="Branch"
                                                            error={
                                                                errors.branch_id
                                                            }
                                                        >
                                                            {({
                                                                id,
                                                                describedBy,
                                                                invalid,
                                                            }) => (
                                                                <NativeSelect
                                                                    id={id}
                                                                    name="branch_id"
                                                                    defaultValue={
                                                                        document.branch_id
                                                                    }
                                                                    aria-describedby={
                                                                        describedBy
                                                                    }
                                                                    aria-invalid={
                                                                        invalid
                                                                    }
                                                                    className="bg-card"
                                                                >
                                                                    {branches.map(
                                                                        (
                                                                            branch,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    branch.id
                                                                                }
                                                                                value={
                                                                                    branch.id
                                                                                }
                                                                            >
                                                                                {branch
                                                                                    .business
                                                                                    ?.name
                                                                                    ? `${branch.business.name} — ${branch.location}`
                                                                                    : branch.location}
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </NativeSelect>
                                                            )}
                                                        </FormField>

                                                        <FormField
                                                            label="Request type"
                                                            error={
                                                                errors.request_type_id
                                                            }
                                                        >
                                                            {({
                                                                id,
                                                                describedBy,
                                                                invalid,
                                                            }) => (
                                                                <NativeSelect
                                                                    id={id}
                                                                    name="request_type_id"
                                                                    defaultValue={
                                                                        document.request_type_id
                                                                    }
                                                                    aria-describedby={
                                                                        describedBy
                                                                    }
                                                                    aria-invalid={
                                                                        invalid
                                                                    }
                                                                    className="bg-card"
                                                                >
                                                                    {requestTypes.map(
                                                                        (
                                                                            type,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    type.id
                                                                                }
                                                                                value={
                                                                                    type.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    type.name
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </NativeSelect>
                                                            )}
                                                        </FormField>

                                                        <FormField
                                                            label="Approval date"
                                                            error={
                                                                errors.approval_date
                                                            }
                                                            optional
                                                        >
                                                            {({
                                                                id,
                                                                describedBy,
                                                                invalid,
                                                            }) => (
                                                                <Input
                                                                    id={id}
                                                                    name="approval_date"
                                                                    type="date"
                                                                    defaultValue={
                                                                        document.approval_date?.slice(
                                                                            0,
                                                                            10,
                                                                        ) ?? ''
                                                                    }
                                                                    aria-describedby={
                                                                        describedBy
                                                                    }
                                                                    aria-invalid={
                                                                        invalid
                                                                    }
                                                                    className="bg-card"
                                                                />
                                                            )}
                                                        </FormField>

                                                        <FormField
                                                            label="Request date"
                                                            error={
                                                                errors.request_date
                                                            }
                                                            optional
                                                        >
                                                            {({
                                                                id,
                                                                describedBy,
                                                                invalid,
                                                            }) => (
                                                                <Input
                                                                    id={id}
                                                                    name="request_date"
                                                                    type="date"
                                                                    defaultValue={
                                                                        document.request_date?.slice(
                                                                            0,
                                                                            10,
                                                                        ) ?? ''
                                                                    }
                                                                    aria-describedby={
                                                                        describedBy
                                                                    }
                                                                    aria-invalid={
                                                                        invalid
                                                                    }
                                                                    className="bg-card"
                                                                />
                                                            )}
                                                        </FormField>
                                                    </div>
                                                </>
                                            )}
                                        </FormDialog>
                                    )
                                }
                            />

                            <SectionCardBody>
                                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    <MetaCell
                                        label="Request type"
                                        value={
                                            document.request_type?.name ?? '—'
                                        }
                                    />
                                    <MetaCell
                                        label="Approval date"
                                        value={dateOnly(document.approval_date)}
                                    />
                                    <MetaCell
                                        label="Request date"
                                        value={dateOnly(document.request_date)}
                                    />
                                    <MetaCell
                                        label="Scanned on"
                                        value={dateOnly(document.scan_date)}
                                    />
                                    <MetaCell
                                        label="Encoded by"
                                        value={
                                            document.uploader?.name ?? 'System'
                                        }
                                    />
                                    <MetaCell
                                        label="Branch"
                                        value={document.branch?.location ?? '—'}
                                    />
                                </dl>
                            </SectionCardBody>
                        </SectionCard>

                        <div className="grid items-start gap-6 lg:grid-cols-2">
                            <SectionCard>
                                <SectionCardHeader
                                    title="Scan versions"
                                    description="Replaced scans are superseded, never lost."
                                    icon={Upload}
                                    actions={
                                        can.replaceFile && (
                                            <FormDialog
                                                trigger={
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Upload className="size-3.5" />
                                                        Replace
                                                    </Button>
                                                }
                                                title="Upload a replacement scan"
                                                description="The current scan becomes a previous version and stays restorable."
                                                icon={Upload}
                                                form={documents.replaceFile.form(
                                                    document.reference,
                                                )}
                                                encType="multipart/form-data"
                                                submitLabel="Upload replacement"
                                                submitIcon={Upload}
                                            >
                                                {({ errors }) => (
                                                    <FormField
                                                        label="Higher quality scan"
                                                        error={errors.file}
                                                        required
                                                        hint="PDF only."
                                                    >
                                                        {({
                                                            id,
                                                            describedBy,
                                                            invalid,
                                                        }) => (
                                                            <Input
                                                                id={id}
                                                                name="file"
                                                                type="file"
                                                                accept="application/pdf"
                                                                aria-describedby={
                                                                    describedBy
                                                                }
                                                                aria-invalid={
                                                                    invalid
                                                                }
                                                                className="cursor-pointer bg-card"
                                                            />
                                                        )}
                                                    </FormField>
                                                )}
                                            </FormDialog>
                                        )
                                    }
                                />

                                {versions.length === 0 ? (
                                    <p className="px-5 py-10 text-center text-xs text-muted-foreground sm:px-6">
                                        No scan on file.
                                    </p>
                                ) : (
                                    <ul className="stagger divide-y divide-border/60">
                                        {versions.map((version) => (
                                            <li
                                                key={version.id}
                                                className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/25 sm:px-6"
                                            >
                                                <div className="min-w-0 space-y-0.5">
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {version.original_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatBytes(
                                                            version.size,
                                                        )}{' '}
                                                        ·{' '}
                                                        {version.uploader
                                                            ?.name ??
                                                            'Unknown'}{' '}
                                                        ·{' '}
                                                        {dateOnly(
                                                            version.created_at,
                                                        )}
                                                    </p>
                                                </div>

                                                {version.is_current ? (
                                                    <StatusBadge
                                                        tone="success"
                                                        dot
                                                        className="shrink-0"
                                                    >
                                                        Current
                                                    </StatusBadge>
                                                ) : (
                                                    can.update && (
                                                        <ConfirmDialog
                                                            trigger={
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="shrink-0"
                                                                >
                                                                    <RotateCcw className="size-3" />
                                                                    Restore
                                                                </Button>
                                                            }
                                                            tone="warning"
                                                            icon={RotateCcw}
                                                            title="Restore this scan?"
                                                            description="It becomes the version staff see, download, and print. The current scan is kept as a previous version."
                                                            form={documents.revertFile.form(
                                                                [
                                                                    document.reference,
                                                                    version.id,
                                                                ],
                                                            )}
                                                            confirmLabel="Restore this scan"
                                                            confirmIcon={
                                                                RotateCcw
                                                            }
                                                            details={
                                                                <div className="space-y-0.5">
                                                                    <p className="font-medium text-foreground">
                                                                        {
                                                                            version.original_name
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatBytes(
                                                                            version.size,
                                                                        )}{' '}
                                                                        ·
                                                                        uploaded{' '}
                                                                        {dateOnly(
                                                                            version.created_at,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            }
                                                        />
                                                    )
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </SectionCard>

                            <SectionCard>
                                <SectionCardHeader
                                    title="Correction history"
                                    description="Audited log of index-card adjustments."
                                    icon={History}
                                    actions={
                                        <Badge
                                            variant="secondary"
                                            className="rounded-full"
                                        >
                                            {changeHistory.length}
                                        </Badge>
                                    }
                                />

                                {changeHistory.length === 0 ? (
                                    <p className="px-5 py-10 text-center text-xs text-muted-foreground sm:px-6">
                                        No corrections have been filed for this
                                        document.
                                    </p>
                                ) : (
                                    <ul className="scroll-slim max-h-96 divide-y divide-border/60 overflow-y-auto">
                                        {changeHistory.map((entry) => (
                                            <li
                                                key={entry.id}
                                                className="flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/25 sm:px-6"
                                            >
                                                <div className="min-w-0 space-y-1">
                                                    <p className="text-xs font-semibold text-foreground">
                                                        {fieldLabel(
                                                            entry.field,
                                                        )}
                                                    </p>
                                                    <p className="text-xs break-words text-muted-foreground">
                                                        <span className="text-destructive/80 line-through decoration-destructive/50">
                                                            {historyValue(
                                                                entry.old_value,
                                                            )}
                                                        </span>{' '}
                                                        &rarr;{' '}
                                                        <span className="font-medium text-foreground">
                                                            {historyValue(
                                                                entry.new_value,
                                                            )}
                                                        </span>
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {entry.changed_by
                                                            ?.name ??
                                                            'Unknown'}{' '}
                                                        ·{' '}
                                                        {accessTimestamp(
                                                            entry.created_at,
                                                        )}
                                                    </p>
                                                </div>

                                                {can.revert && (
                                                    <ConfirmDialog
                                                        trigger={
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="shrink-0 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <RotateCcw className="size-3" />
                                                                Revert
                                                            </Button>
                                                        }
                                                        tone="warning"
                                                        icon={RotateCcw}
                                                        title="Revert this correction?"
                                                        description="The field goes back to its earlier value. The revert is itself recorded as a new history entry."
                                                        form={documents.revert.form(
                                                            [
                                                                document.reference,
                                                                entry.id,
                                                            ],
                                                        )}
                                                        confirmLabel="Revert field"
                                                        confirmIcon={RotateCcw}
                                                        details={
                                                            <div className="space-y-1">
                                                                <p className="font-medium text-foreground">
                                                                    {fieldLabel(
                                                                        entry.field,
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Back to{' '}
                                                                    <span className="font-medium text-foreground">
                                                                        {historyValue(
                                                                            entry.old_value,
                                                                        )}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        }
                                                    />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </SectionCard>
                        </div>

                        {can.viewAccessLog && (
                            <SectionCard>
                                <SectionCardHeader
                                    title="Access and security log"
                                    description="Recorded whenever the private PDF is viewed, downloaded, or printed."
                                    icon={Eye}
                                    actions={
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link
                                                href={admin.accessLogs.index.url(
                                                    {
                                                        query: {
                                                            reference:
                                                                document.reference,
                                                        },
                                                    },
                                                )}
                                            >
                                                Full audit log
                                            </Link>
                                        </Button>
                                    }
                                />

                                {access.length === 0 ? (
                                    <p className="px-5 py-10 text-center text-xs text-muted-foreground sm:px-6">
                                        Nobody has opened this document yet.
                                    </p>
                                ) : (
                                    <ul className="stagger divide-y divide-border/60">
                                        {access.map((entry) => (
                                            <li
                                                key={entry.id}
                                                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/25 sm:px-6"
                                            >
                                                <span className="truncate text-xs font-medium text-foreground">
                                                    {entry.user?.name ??
                                                        'Deleted account'}
                                                </span>
                                                <div className="flex shrink-0 items-center gap-3">
                                                    <StatusBadge
                                                        tone={
                                                            accessToneByAction[
                                                                entry.action
                                                            ]
                                                        }
                                                        className="capitalize"
                                                    >
                                                        {entry.action}
                                                    </StatusBadge>
                                                    <span className="text-xs text-muted-foreground tabular-nums">
                                                        {accessTimestamp(
                                                            entry.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </SectionCard>
                        )}
                    </div>

                    {/*
                     * Sticky rail: where the paper is, and the two actions that
                     * change it. Kept in view because the question a clerk
                     * actually walks over with is "which building".
                     */}
                    <div className="flex flex-col gap-6 xl:sticky xl:top-22">
                        <SectionCard>
                            <SectionCardHeader
                                title="Physical location"
                                description="Where the original paper sits right now."
                                icon={MapPin}
                            />
                            <SectionCardBody className="space-y-4">
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-3.5">
                                    <div className="min-w-0 space-y-0.5">
                                        <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                            Current facility
                                        </p>
                                        <p className="text-base font-semibold text-balance text-foreground">
                                            {document.storage_location?.name ??
                                                'Unknown storage'}
                                        </p>
                                    </div>
                                    <StatusBadge
                                        tone="info"
                                        dot
                                        className="shrink-0"
                                    >
                                        Tracked
                                    </StatusBadge>
                                </div>

                                {can.update && (
                                    <Form
                                        {...documents.update.form(
                                            document.reference,
                                        )}
                                        className="grid gap-2.5"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <FormField
                                                    label="Reassign storage location"
                                                    error={
                                                        errors.storage_location_id
                                                    }
                                                >
                                                    {({
                                                        id,
                                                        describedBy,
                                                        invalid,
                                                    }) => (
                                                        <NativeSelect
                                                            id={id}
                                                            name="storage_location_id"
                                                            defaultValue={
                                                                document.storage_location_id
                                                            }
                                                            aria-describedby={
                                                                describedBy
                                                            }
                                                            aria-invalid={
                                                                invalid
                                                            }
                                                            className="bg-card"
                                                        >
                                                            {storageLocations.map(
                                                                (location) => (
                                                                    <option
                                                                        key={
                                                                            location.id
                                                                        }
                                                                        value={
                                                                            location.id
                                                                        }
                                                                    >
                                                                        {
                                                                            location.name
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </NativeSelect>
                                                    )}
                                                </FormField>

                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    variant="outline"
                                                    pending={processing}
                                                    className="justify-self-start"
                                                >
                                                    Save new location
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                )}
                            </SectionCardBody>
                        </SectionCard>

                        {can.requestDeletion && !pendingDeletion && (
                            <SectionCard tone="danger">
                                <SectionCardHeader
                                    title="Request deletion"
                                    description="An administrator decides. The document is hidden from search the moment the request is filed."
                                    icon={Trash2}
                                    tone="danger"
                                    className="border-destructive/20 bg-destructive/[0.04]"
                                />
                                <SectionCardBody>
                                    <FormDialog
                                        trigger={
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <Trash2 className="size-3.5" />
                                                Request deletion
                                            </Button>
                                        }
                                        title="File a deletion request"
                                        description="Say plainly why this scan should go. An administrator reads exactly what you write here."
                                        icon={Trash2}
                                        form={documents.deletionRequests.store.form(
                                            document.reference,
                                        )}
                                        submitLabel="Submit request"
                                        submitIcon={Trash2}
                                        submitVariant="destructive"
                                        size="md"
                                        footerNote="Hidden from search until decided."
                                    >
                                        {({ errors }) => (
                                            <>
                                                <Callout
                                                    tone="danger"
                                                    title="What happens next"
                                                >
                                                    The document disappears from
                                                    ordinary search results
                                                    immediately. If approved it
                                                    is held in cold storage for
                                                    90 days, then removed for
                                                    good.
                                                </Callout>

                                                <FormField
                                                    label="Reason for deletion"
                                                    error={errors.reason}
                                                    required
                                                    hint="Be specific enough that the administrator does not have to come and ask."
                                                >
                                                    {({
                                                        id,
                                                        describedBy,
                                                        invalid,
                                                    }) => (
                                                        <Textarea
                                                            id={id}
                                                            name="reason"
                                                            rows={4}
                                                            autoFocus
                                                            aria-describedby={
                                                                describedBy
                                                            }
                                                            aria-invalid={
                                                                invalid
                                                            }
                                                            placeholder="e.g. Duplicate scan of the document encoded on 12 March under the same branch."
                                                            className="bg-card"
                                                        />
                                                    )}
                                                </FormField>
                                            </>
                                        )}
                                    </FormDialog>
                                </SectionCardBody>
                            </SectionCard>
                        )}
                    </div>
                </div>
            </PageContainer>
        </>
    );
}

DocumentShow.layout = {
    breadcrumbs: [{ title: 'Documents', href: documents.index() }],
};
