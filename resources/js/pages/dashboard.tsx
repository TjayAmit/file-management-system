import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CalendarPlus,
    FileText,
    MapPin,
    Search as SearchIcon,
    Tags,
    Trash2,
    TrendingUp,
    Warehouse,
} from 'lucide-react';
import EmptyState from '@/components/empty-state';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import deletionRequests from '@/routes/deletion-requests';
import documents from '@/routes/documents';
import search from '@/routes/search';

type Statistics = {
    documents: number;
    businesses: number;
    branches: number;
    request_types: number;
    pending_deletions: number;
    encoded_this_month: number;
    by_storage_location: { name: string; total: number }[];
};

type HitRate = {
    total: number;
    hits: number;
    misses: number;
    hit_rate: number;
};

type ActivityEntry = {
    id: number;
    action: string;
    created_at: string;
    user?: { name: string } | null;
};

export default function Dashboard({
    statistics,
    hitRate,
    recentActivity,
    can,
}: {
    statistics: Statistics;
    hitRate: HitRate | null;
    recentActivity: ActivityEntry[] | null;
    can: { encode: boolean; viewReport: boolean };
}) {
    const locatedTotal = statistics.by_storage_location.reduce(
        (total, location) => total + location.total,
        0,
    );

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="The archive at a glance"
                    description="What the index holds, where the paper sits, and whether staff are finding what they came for."
                    actions={
                        <>
                            <Button asChild variant="outline">
                                <Link href={search.index()}>
                                    <SearchIcon />
                                    Search the archive
                                </Link>
                            </Button>
                            {can.encode && (
                                <Button asChild>
                                    <Link href={documents.create()}>
                                        Encode a document
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            )}
                        </>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={FileText}
                        label="Documents indexed"
                        value={statistics.documents}
                        hint="Every scanned PDF with a metadata card."
                    />
                    <StatCard
                        icon={CalendarPlus}
                        label="Encoded this month"
                        value={statistics.encoded_this_month}
                        hint="Growth comes from the retrieval workflow itself."
                    />
                    <StatCard
                        icon={Building2}
                        label="Known businesses"
                        value={statistics.businesses}
                        hint={`${statistics.branches} branches on file.`}
                    />
                    <StatCard
                        icon={Tags}
                        label="Request types"
                        value={statistics.request_types}
                        hint="The controlled second-stage filter."
                    />
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <section className="rounded-xl border border-border bg-card">
                        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                    <Warehouse className="size-4" />
                                </span>
                                <div>
                                    <h2 className="font-semibold">
                                        Where the paper is
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Before anyone walks anywhere.
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="rounded-full">
                                {locatedTotal} tracked
                            </Badge>
                        </header>

                        {statistics.by_storage_location.length === 0 ? (
                            <EmptyState
                                icon={MapPin}
                                title="No storage locations yet"
                                description="An admin defines the office and the central storage building before transfers can be tracked."
                            />
                        ) : (
                            <ul className="divide-y divide-border">
                                {statistics.by_storage_location.map(
                                    (location) => {
                                        const share =
                                            locatedTotal === 0
                                                ? 0
                                                : Math.round(
                                                      (location.total /
                                                          locatedTotal) *
                                                          100,
                                                  );

                                        return (
                                            <li
                                                key={location.name}
                                                className="px-5 py-4"
                                            >
                                                <div className="flex items-baseline justify-between gap-3">
                                                    <span className="truncate font-medium">
                                                        {location.name}
                                                    </span>
                                                    <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                                                        {location.total} doc
                                                        {location.total === 1
                                                            ? ''
                                                            : 's'}{' '}
                                                        &middot; {share}%
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary"
                                                        style={{
                                                            width: `${share}%`,
                                                        }}
                                                    />
                                                </div>
                                            </li>
                                        );
                                    },
                                )}
                            </ul>
                        )}
                    </section>

                    <div className="flex flex-col gap-6">
                        {hitRate && (
                            <section className="rounded-xl border border-border bg-card p-5">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                        <TrendingUp className="size-4" />
                                    </span>
                                    <div>
                                        <h2 className="font-semibold">
                                            Search hit rate
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Target is 60%.
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums">
                                    {hitRate.hit_rate}%
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {hitRate.hits} of {hitRate.total} searches
                                    ended in an opened document.
                                </p>
                                {can.viewReport && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="mt-4"
                                    >
                                        <Link href={search.report()}>
                                            Open the full report
                                        </Link>
                                    </Button>
                                )}
                            </section>
                        )}

                        {statistics.pending_deletions > 0 && (
                            <section className="rounded-xl border border-border bg-card p-5">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                        <Trash2 className="size-4" />
                                    </span>
                                    <div>
                                        <h2 className="font-semibold">
                                            Deletion requests
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {statistics.pending_deletions}{' '}
                                            awaiting a decision.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                >
                                    <Link href={deletionRequests.index()}>
                                        Review the queue
                                    </Link>
                                </Button>
                            </section>
                        )}

                        {recentActivity && recentActivity.length > 0 && (
                            <section className="rounded-xl border border-border bg-card">
                                <header className="border-b border-border px-5 py-4">
                                    <h2 className="font-semibold">
                                        Recent activity
                                    </h2>
                                </header>
                                <ul className="divide-y divide-border">
                                    {recentActivity.map((entry) => (
                                        <li
                                            key={entry.id}
                                            className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                                        >
                                            <span className="truncate font-mono text-xs">
                                                {entry.action}
                                            </span>
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {entry.user?.name ?? 'System'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
