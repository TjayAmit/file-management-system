import { Head } from '@inertiajs/react';
import { History, User } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import type { Paginated } from '@/components/paginator';
import Paginator from '@/components/paginator';
import { SectionCard, SectionCardHeader } from '@/components/section-card';
import { Badge } from '@/components/ui/badge';
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

function detailPairs(
    details: Record<string, unknown> | null,
): { key: string; value: string }[] {
    if (!details) {
        return [];
    }

    return Object.entries(details).map(([key, value]) => ({
        key: key.replace(/_/g, ' '),
        value:
            value === null || value === undefined
                ? '—'
                : typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value),
    }));
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
            <Head title="System Activity Log" />
            <PageContainer width="full">
                <PageHeader
                    title="Activity Audit Log"
                    icon={History}
                    description="Append-only compliance record of who modified metadata, merged records, or relocated physical folders. Entries cannot be edited or purged."
                    badge={
                        <Badge
                            variant="secondary"
                            className="rounded-full font-mono text-[11px]"
                        >
                            {activities.total} event
                            {activities.total === 1 ? '' : 's'}
                        </Badge>
                    }
                />

                <SectionCard>
                    <SectionCardHeader
                        title="Every recorded action"
                        description="Newest first. Details show exactly what changed."
                        icon={History}
                    />

                    {activities.data.length === 0 ? (
                        <EmptyState
                            icon={History}
                            title="No activity recorded yet"
                            description="Entries populate automatically as staff encode, correct, transfer, and administer documents."
                        />
                    ) : (
                        <div className="scroll-slim overflow-x-auto">
                            <Table>
                                <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-48 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-6">
                                            Timestamp
                                        </TableHead>
                                        <TableHead className="w-40 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Performer
                                        </TableHead>
                                        <TableHead className="w-44 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Action
                                        </TableHead>
                                        <TableHead className="w-40 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Subject
                                        </TableHead>
                                        <TableHead className="px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-6">
                                            Details
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="stagger">
                                    {activities.data.map((activity) => (
                                        <TableRow
                                            key={activity.id}
                                            className="border-border/60 transition-colors hover:bg-muted/30"
                                        >
                                            <TableCell className="px-5 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums sm:px-6">
                                                {formatTimestamp(
                                                    activity.created_at,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <User className="size-3 shrink-0 text-muted-foreground" />
                                                    <span className="truncate">
                                                        {activity.user?.name ??
                                                            'System process'}
                                                    </span>
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-muted/80 font-mono text-[10px] text-foreground"
                                                >
                                                    {activity.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                <span className="font-semibold text-foreground">
                                                    {subjectLabel(
                                                        activity.subject_type,
                                                    )}
                                                </span>
                                                {activity.subject_id !==
                                                    null && (
                                                    <span className="ml-1 font-mono text-[11px]">
                                                        #{activity.subject_id}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-5 py-3 sm:px-6">
                                                {detailPairs(activity.details)
                                                    .length === 0 ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {detailPairs(
                                                            activity.details,
                                                        ).map((pair) => (
                                                            <span
                                                                key={pair.key}
                                                                className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-[11px]"
                                                            >
                                                                <span className="font-medium text-muted-foreground capitalize">
                                                                    {pair.key}:
                                                                </span>
                                                                <span className="max-w-48 truncate font-mono text-foreground">
                                                                    {pair.value}
                                                                </span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <Paginator
                        page={activities}
                        noun="entry"
                        plural="entries"
                    />
                </SectionCard>
            </PageContainer>
        </>
    );
}

ActivityIndex.layout = {
    breadcrumbs: [{ title: 'Activity Log', href: admin.activities.index() }],
};
