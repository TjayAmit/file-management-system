import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Check,
    FileText,
    History,
    ShieldAlert,
    Trash2,
    User,
    X,
} from 'lucide-react';
import Callout from '@/components/callout';
import ConfirmDialog from '@/components/confirm-dialog';
import EmptyState from '@/components/empty-state';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import { SectionCard, SectionCardHeader } from '@/components/section-card';
import type { StatusTone } from '@/components/status-badge';
import StatusBadge from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import deletionRequests from '@/routes/deletion-requests';
import documents from '@/routes/documents';

type DeletionRequestRow = {
    id: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    decided_at: string | null;
    document?: {
        reference: string;
        title: string | null;
        branch?: {
            location: string;
            business?: { name: string } | null;
        } | null;
    } | null;
    requester?: { name: string } | null;
    approver?: { name: string } | null;
};

const statusTones: Record<DeletionRequestRow['status'], StatusTone> = {
    pending: 'warning',
    approved: 'danger',
    rejected: 'neutral',
};

function formatQueueDate(timestamp: string): string {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return timestamp.slice(0, 10);
    }

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function documentTitle(request: DeletionRequestRow): string {
    return request.document?.title ?? 'Untitled document';
}

function DocumentLine({ request }: { request: DeletionRequestRow }) {
    if (!request.document) {
        return (
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <FileText className="size-4 shrink-0" />
                <span>Document removed from storage</span>
            </div>
        );
    }

    return (
        <Link
            href={documents.show(request.document.reference)}
            className="group flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
            <FileText className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            <span className="truncate">{documentTitle(request)}</span>
        </Link>
    );
}

function RequestMeta({ request }: { request: DeletionRequestRow }) {
    return (
        <p className="truncate text-xs text-muted-foreground">
            {request.document?.branch?.business?.name ?? 'Unknown business'}
            {' · '}
            {request.document?.branch?.location ?? 'No branch'}
            {request.document?.reference && (
                <>
                    {' · '}
                    <span className="font-mono text-[11px]">
                        {request.document.reference}
                    </span>
                </>
            )}
        </p>
    );
}

function ReasonBlock({ reason }: { reason: string }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
            <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Stated rationale
            </p>
            <p className="mt-1 text-xs leading-relaxed text-pretty text-foreground italic">
                &ldquo;{reason}&rdquo;
            </p>
        </div>
    );
}

export default function DeletionRequestIndex({
    deletionRequests: requests,
    can,
}: {
    deletionRequests: DeletionRequestRow[];
    can: { decide: boolean };
}) {
    const pending = requests.filter((request) => request.status === 'pending');
    const decided = requests.filter((request) => request.status !== 'pending');

    return (
        <>
            <Head title="Deletion Approvals Queue" />
            <PageContainer>
                <PageHeader
                    title="Deletion Requests"
                    icon={ShieldAlert}
                    description="No document is erased without administrative verification. A pending request suppresses the document from search while an administrator reviews the rationale."
                    badge={
                        <Badge variant="secondary" className="rounded-full">
                            {requests.length} total
                        </Badge>
                    }
                />

                {pending.length > 0 && (
                    <Callout
                        tone="warning"
                        icon={AlertTriangle}
                        title={`${pending.length} request${pending.length === 1 ? '' : 's'} awaiting administrative review`}
                    >
                        Documents with a pending request are already hidden from
                        normal search results, so every day one sits here is a
                        day staff cannot find that file.
                    </Callout>
                )}

                <SectionCard>
                    <SectionCardHeader
                        title="Awaiting decision"
                        description="Each request states what an editor wants removed and why."
                        icon={ShieldAlert}
                        tone={pending.length > 0 ? 'warning' : 'default'}
                        actions={
                            <StatusBadge
                                tone={
                                    pending.length > 0 ? 'warning' : 'success'
                                }
                                dot
                                pulse={pending.length > 0}
                            >
                                {pending.length} pending
                            </StatusBadge>
                        }
                    />

                    {pending.length === 0 ? (
                        <EmptyState
                            icon={Check}
                            title="Nothing waiting on you"
                            description="When an editor flags a duplicate, obsolete, or incorrect scan, the proposal appears here for review."
                        />
                    ) : (
                        <ul className="stagger grid gap-4 p-5 sm:p-6 xl:grid-cols-2">
                            {pending.map((request) => (
                                <li
                                    key={request.id}
                                    className="flex min-w-0 flex-col gap-3.5 rounded-xl border border-warning/35 bg-warning-muted/25 p-4 transition-colors hover:border-warning/50"
                                >
                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <DocumentLine request={request} />
                                            <RequestMeta request={request} />
                                        </div>
                                        <StatusBadge
                                            tone="warning"
                                            dot
                                            pulse
                                            className="shrink-0"
                                        >
                                            Pending
                                        </StatusBadge>
                                    </div>

                                    <ReasonBlock reason={request.reason} />

                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-warning/25 pt-3">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                                                <User className="size-3" />
                                                {request.requester?.name ??
                                                    'System'}
                                            </span>
                                            <span className="flex items-center gap-1 tabular-nums">
                                                <Calendar className="size-3" />
                                                {formatQueueDate(
                                                    request.created_at,
                                                )}
                                            </span>
                                        </div>

                                        {can.decide && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <ConfirmDialog
                                                    trigger={
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <X className="size-3.5" />
                                                            Reject
                                                        </Button>
                                                    }
                                                    tone="primary"
                                                    icon={X}
                                                    title="Reject this deletion request?"
                                                    description="The document returns to normal search results immediately and nothing is removed."
                                                    form={deletionRequests.reject.form(
                                                        request.id,
                                                    )}
                                                    confirmLabel="Reject and restore"
                                                    confirmIcon={X}
                                                    details={
                                                        <div className="space-y-1">
                                                            <p className="font-medium text-foreground">
                                                                {documentTitle(
                                                                    request,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Filed by{' '}
                                                                {request
                                                                    .requester
                                                                    ?.name ??
                                                                    'System'}{' '}
                                                                on{' '}
                                                                {formatQueueDate(
                                                                    request.created_at,
                                                                )}
                                                            </p>
                                                        </div>
                                                    }
                                                />

                                                <ConfirmDialog
                                                    trigger={
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                            Approve
                                                        </Button>
                                                    }
                                                    tone="danger"
                                                    title="Approve permanent deletion?"
                                                    description="The document leaves the archive. It is held in cold storage for 90 days and then it is gone."
                                                    form={deletionRequests.approve.form(
                                                        request.id,
                                                    )}
                                                    confirmLabel="Approve deletion"
                                                    confirmIcon={Trash2}
                                                    confirmPhrase="DELETE"
                                                    size="md"
                                                    details={
                                                        <div className="space-y-2">
                                                            <p className="font-medium text-foreground">
                                                                {documentTitle(
                                                                    request,
                                                                )}
                                                            </p>
                                                            <RequestMeta
                                                                request={
                                                                    request
                                                                }
                                                            />
                                                            <p className="text-xs text-muted-foreground italic">
                                                                &ldquo;
                                                                {request.reason}
                                                                &rdquo;
                                                            </p>
                                                        </div>
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>

                <SectionCard>
                    <SectionCardHeader
                        title="Decision history"
                        description="An append-only record of what was approved, what was rejected, and by whom."
                        icon={History}
                        actions={
                            <Badge variant="secondary" className="rounded-full">
                                {decided.length} decided
                            </Badge>
                        }
                    />

                    {decided.length === 0 ? (
                        <EmptyState
                            icon={History}
                            title="No decisions recorded yet"
                            description="Approved and rejected requests are kept here permanently as an audit trail."
                        />
                    ) : (
                        <ul className="stagger divide-y divide-border/60">
                            {decided.map((request) => (
                                <li
                                    key={request.id}
                                    className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2.5 px-5 py-4 transition-colors hover:bg-muted/25 sm:px-6"
                                >
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <DocumentLine request={request} />
                                        <RequestMeta request={request} />
                                        <p className="truncate text-xs text-muted-foreground italic">
                                            &ldquo;{request.reason}&rdquo;
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                                        <StatusBadge
                                            tone={statusTones[request.status]}
                                            dot
                                            className="capitalize"
                                        >
                                            {request.status}
                                        </StatusBadge>
                                        <p className="text-xs text-muted-foreground">
                                            {request.approver
                                                ? `by ${request.approver.name}`
                                                : 'decided'}
                                            {request.decided_at &&
                                                ` · ${formatQueueDate(request.decided_at)}`}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>
            </PageContainer>
        </>
    );
}

DeletionRequestIndex.layout = {
    breadcrumbs: [
        { title: 'Deletion Requests', href: deletionRequests.index() },
    ],
};
