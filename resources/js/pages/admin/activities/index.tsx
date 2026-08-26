import { Head } from '@inertiajs/react';
import { History } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import type { Paginated } from '@/components/paginator';
import Paginator from '@/components/paginator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import admin from '@/routes/admin';

type ActivityItem = {
    id: number;
    user: { id: number; name: string } | null;
    subject_type: string | null;
    subject_id: number | null;
    action: string;
    details: Record<string, unknown> | null;
    created_at: string;
};

function formatTimestamp(value: string): string {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function subjectLabel(subjectType: string | null): string {
    if (!subjectType) {
        return '—';
    }

    return subjectType.split('\\').pop() ?? subjectType;
}

export default function ActivityIndex({
    activities,
}: {
    activities: Paginated<ActivityItem>;
}) {
    return (
        <>
            <Head title="Activity log" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Activity log"
                    description="Append-only accountability: who changed what, and when. Nothing here can be edited or removed."
                />

                <section className="rounded-xl border border-border bg-card">
                    {activities.data.length === 0 ? (
                        <EmptyState
                            icon={History}
                            title="Nothing recorded yet"
                            description="Entries appear as staff encode, correct, transfer, and administer the archive."
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>When</TableHead>
                                    <TableHead>Who</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Subject</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activities.data.map((activity) => (
                                    <TableRow key={activity.id}>
                                        <TableCell className="whitespace-nowrap tabular-nums">
                                            {formatTimestamp(
                                                activity.created_at,
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {activity.user?.name ?? 'System'}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {activity.action}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {subjectLabel(
                                                activity.subject_type,
                                            )}
                                            {activity.subject_id !== null
                                                ? ` #${activity.subject_id}`
                                                : ''}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <Paginator
                        page={activities}
                        noun="entry"
                        plural="entries"
                    />
                </section>
            </div>
        </>
    );
}

ActivityIndex.layout = {
    breadcrumbs: [{ title: 'Activity log', href: admin.activities.index() }],
};
