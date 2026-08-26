import { Form, Head, Link } from '@inertiajs/react';
import { Check, Trash2, X } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import FlashMessage from '@/components/flash-message';
import PageHeader from '@/components/page-header';
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

const statusStyles: Record<DeletionRequestRow['status'], string> = {
    pending: 'bg-primary text-primary-foreground',
    approved: 'bg-destructive text-white',
    rejected: 'bg-muted text-muted-foreground',
};

export default function DeletionRequestIndex({
    deletionRequests: requests,
    can,
}: {
    deletionRequests: DeletionRequestRow[];
    can: { decide: boolean };
}) {
    const pending = requests.filter((request) => request.status === 'pending');

    return (
        <>
            <Head title="Deletion requests" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Deletion requests"
                    description="Nothing is deleted on one person's say-so. A request hides the document from search; an admin decides, and the file is kept for 90 days after approval."
                />

                <FlashMessage />

                {pending.length > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                        <Trash2 className="size-4 shrink-0 text-primary" />
                        <span>
                            <span className="font-medium">
                                {pending.length}
                            </span>{' '}
                            request{pending.length === 1 ? '' : 's'} awaiting a
                            decision.
                        </span>
                    </div>
                )}

                <section className="rounded-xl border border-border bg-card">
                    {requests.length === 0 ? (
                        <EmptyState
                            icon={Trash2}
                            title="Nothing has been proposed for deletion"
                            description="Editors file a request from a document page when a scan is a duplicate or plainly wrong."
                        />
                    ) : (
                        <ul className="divide-y divide-border">
                            {requests.map((request) => (
                                <li key={request.id} className="px-5 py-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            {request.document ? (
                                                <Link
                                                    href={documents.show(
                                                        request.document
                                                            .reference,
                                                    )}
                                                    className="font-medium hover:underline"
                                                >
                                                    {request.document.title ??
                                                        'Untitled document'}
                                                </Link>
                                            ) : (
                                                <span className="font-medium">
                                                    Document removed
                                                </span>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {request.document?.branch
                                                    ?.business?.name ??
                                                    'Unknown business'}{' '}
                                                &middot;{' '}
                                                {request.document?.branch
                                                    ?.location ?? 'no branch'}
                                            </p>
                                        </div>
                                        <Badge
                                            className={`shrink-0 rounded-full capitalize ${statusStyles[request.status]}`}
                                        >
                                            {request.status}
                                        </Badge>
                                    </div>

                                    <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                                        {request.reason}
                                    </p>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Filed by{' '}
                                        {request.requester?.name ?? 'someone'}{' '}
                                        on {request.created_at.slice(0, 10)}
                                        {request.approver &&
                                            ` · decided by ${request.approver.name}`}
                                    </p>

                                    {can.decide &&
                                        request.status === 'pending' && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <Form
                                                    {...deletionRequests.approve.form(
                                                        request.id,
                                                    )}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <Check />
                                                            Approve deletion
                                                        </Button>
                                                    )}
                                                </Form>
                                                <Form
                                                    {...deletionRequests.reject.form(
                                                        request.id,
                                                    )}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <X />
                                                            Reject and restore
                                                        </Button>
                                                    )}
                                                </Form>
                                            </div>
                                        )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}

DeletionRequestIndex.layout = {
    breadcrumbs: [
        { title: 'Deletion requests', href: deletionRequests.index() },
    ],
};
