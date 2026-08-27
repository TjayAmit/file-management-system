import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Building2,
    CalendarPlus,
    FilePlus2,
    FileText,
    History,
    MapPin,
    Search as SearchIcon,
    Sparkles,
    Tags,
    Trash2,
    TrendingUp,
    Truck,
    Warehouse,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import EmptyState from '@/components/empty-state';
import PageContainer from '@/components/page-container';
import {
    SectionCard,
    SectionCardBody,
    SectionCardHeader,
} from '@/components/section-card';
import StatCard from '@/components/stat-card';
import StatusBadge from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import deletionRequests from '@/routes/deletion-requests';
import documents from '@/routes/documents';
import search from '@/routes/search';
import transfers from '@/routes/transfers';

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

function formatActivityTime(timestamp: string): string {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function QuickAction({
    href,
    icon: Icon,
    title,
    description,
    accent,
}: {
    href: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
    accent: string;
}) {
    return (
        <Link
            href={href}
            className="group flex flex-col justify-between rounded-xl border border-border/80 bg-muted/20 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-sm motion-reduce:hover:translate-y-0"
        >
            <span
                className={`flex size-9 items-center justify-center rounded-lg ${accent}`}
            >
                <Icon className="size-4" />
            </span>
            <span className="mt-3 block">
                <span className="block text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                    {title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                    {description}
                </span>
            </span>
        </Link>
    );
}

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
    const { auth } = usePage().props;
    const userName = auth.user?.name ? auth.user.name.split(' ')[0] : 'there';
    const role = auth.user?.role ?? 'viewer';

    const locatedTotal = statistics.by_storage_location.reduce(
        (total, location) => total + location.total,
        0,
    );

    const hitRateMeetsTarget = (hitRate?.hit_rate ?? 0) >= 60;

    return (
        <>
            <Head title="Dashboard" />
            <PageContainer width="full">
                <div className="animate-rise relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-xs sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    <Sparkles className="size-3" />
                                    Archive overview
                                </span>
                                <StatusBadge
                                    tone={
                                        role === 'admin'
                                            ? 'primary'
                                            : role === 'editor'
                                              ? 'info'
                                              : 'neutral'
                                    }
                                    className="capitalize"
                                >
                                    {role} role
                                </StatusBadge>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Welcome back, {userName}
                            </h1>
                            <p className="max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
                                What the index holds, where the paper sits, and
                                whether staff are finding what they came for.
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                            <Button asChild variant="outline">
                                <Link href={search.index()} prefetch>
                                    <SearchIcon />
                                    Search index
                                </Link>
                            </Button>
                            {can.encode && (
                                <Button asChild>
                                    <Link href={documents.create()} prefetch>
                                        <FilePlus2 />
                                        Encode document
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={FileText}
                        tone="primary"
                        label="Documents indexed"
                        value={statistics.documents}
                        hint="Every scanned PDF with a metadata card."
                    />
                    <StatCard
                        icon={CalendarPlus}
                        tone="success"
                        label="Encoded this month"
                        value={statistics.encoded_this_month}
                        hint="Growth comes from the retrieval workflow itself."
                    />
                    <StatCard
                        icon={Building2}
                        tone="info"
                        label="Known businesses"
                        value={statistics.businesses}
                        hint={`${statistics.branches} branches registered on file.`}
                    />
                    <StatCard
                        icon={Tags}
                        tone="neutral"
                        label="Request types"
                        value={statistics.request_types}
                        hint="The controlled second-stage filter."
                    />
                </div>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                    <div className="flex min-w-0 flex-col gap-6">
                        <SectionCard>
                            <SectionCardHeader
                                title="Where the paper is"
                                description="Physical storage distribution across facilities."
                                icon={Warehouse}
                                actions={
                                    <Badge
                                        variant="secondary"
                                        className="rounded-full"
                                    >
                                        {locatedTotal} tracked
                                    </Badge>
                                }
                            />

                            {statistics.by_storage_location.length === 0 ? (
                                <EmptyState
                                    icon={MapPin}
                                    title="No storage locations yet"
                                    description="An admin defines the office and the central storage building before transfers can be tracked."
                                />
                            ) : (
                                <ul className="stagger divide-y divide-border/60">
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
                                                    className="group px-5 py-4 transition-colors hover:bg-muted/30 sm:px-6"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="flex min-w-0 items-center gap-2.5">
                                                            <MapPin className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                                                            <span className="truncate font-medium text-foreground">
                                                                {location.name}
                                                            </span>
                                                        </span>
                                                        <span className="flex shrink-0 items-center gap-2">
                                                            <span className="text-xs font-semibold text-foreground tabular-nums">
                                                                {location.total}{' '}
                                                                doc
                                                                {location.total ===
                                                                1
                                                                    ? ''
                                                                    : 's'}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                                ({share}%)
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-primary transition-all duration-500"
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
                        </SectionCard>

                        <SectionCard>
                            <SectionCardHeader
                                title="Quick operations"
                                description="The three things staff open this page to start."
                                icon={Sparkles}
                            />
                            <SectionCardBody>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <QuickAction
                                        href={search.index().url}
                                        icon={SearchIcon}
                                        title="Search archive"
                                        description="Find by business or address"
                                        accent="bg-primary/10 text-primary"
                                    />
                                    <QuickAction
                                        href={documents.index().url}
                                        icon={FileText}
                                        title="Browse documents"
                                        description="View the indexed repository"
                                        accent="bg-info/10 text-info"
                                    />
                                    <QuickAction
                                        href={transfers.index().url}
                                        icon={Truck}
                                        title="Physical transfers"
                                        description="Move paper batches"
                                        accent="bg-success/10 text-success"
                                    />
                                </div>
                            </SectionCardBody>
                        </SectionCard>
                    </div>

                    <div className="flex min-w-0 flex-col gap-6">
                        {hitRate && (
                            <SectionCard>
                                <SectionCardHeader
                                    title="Search hit rate"
                                    description="Target benchmark is 60%."
                                    icon={TrendingUp}
                                    actions={
                                        <StatusBadge
                                            tone={
                                                hitRateMeetsTarget
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                            dot
                                            pulse={!hitRateMeetsTarget}
                                        >
                                            {hitRateMeetsTarget
                                                ? 'On target'
                                                : 'Below target'}
                                        </StatusBadge>
                                    }
                                />
                                <SectionCardBody>
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-4xl font-bold tracking-tight text-foreground tabular-nums">
                                            {hitRate.hit_rate}%
                                        </p>
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            {hitRate.hits} hits /{' '}
                                            {hitRate.total} searches
                                        </span>
                                    </div>

                                    <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                hitRateMeetsTarget
                                                    ? 'bg-success'
                                                    : 'bg-warning'
                                            }`}
                                            style={{
                                                width: `${Math.min(hitRate.hit_rate, 100)}%`,
                                            }}
                                        />
                                        <div
                                            aria-hidden
                                            title="60% target"
                                            className="absolute inset-y-0 w-0.5 bg-foreground/60"
                                            style={{ left: '60%' }}
                                        />
                                    </div>

                                    <p className="mt-3 text-xs leading-relaxed text-pretty text-muted-foreground">
                                        {hitRate.hits} searches ended in an
                                        opened document. A high hit rate means
                                        clerks are finding files digitally
                                        instead of walking to storage.
                                    </p>

                                    {can.viewReport && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="mt-4 w-full justify-center"
                                        >
                                            <Link
                                                href={search.report()}
                                                prefetch
                                            >
                                                View full analytics
                                                <ArrowRight className="size-3.5" />
                                            </Link>
                                        </Button>
                                    )}
                                </SectionCardBody>
                            </SectionCard>
                        )}

                        {statistics.pending_deletions > 0 && (
                            <SectionCard tone="warning">
                                <SectionCardBody className="flex items-start gap-3.5">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/20 text-warning-foreground">
                                        <AlertCircle className="size-5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="font-semibold text-foreground">
                                                Deletion queue
                                            </h2>
                                            <StatusBadge
                                                tone="warning"
                                                dot
                                                pulse
                                            >
                                                {statistics.pending_deletions}{' '}
                                                pending
                                            </StatusBadge>
                                        </div>
                                        <p className="mt-1 text-xs leading-relaxed text-pretty text-muted-foreground">
                                            {statistics.pending_deletions}{' '}
                                            document deletion request
                                            {statistics.pending_deletions === 1
                                                ? ''
                                                : 's'}{' '}
                                            awaiting review. Each one is hidden
                                            from search while it waits.
                                        </p>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                            className="mt-3.5"
                                        >
                                            <Link
                                                href={deletionRequests.index()}
                                                prefetch
                                            >
                                                <Trash2 className="size-3.5" />
                                                Review the queue
                                            </Link>
                                        </Button>
                                    </div>
                                </SectionCardBody>
                            </SectionCard>
                        )}

                        {recentActivity && recentActivity.length > 0 && (
                            <SectionCard>
                                <SectionCardHeader
                                    title="Recent activity"
                                    description="The newest entries in the audit log."
                                    icon={History}
                                    actions={
                                        <Badge
                                            variant="outline"
                                            className="rounded-full"
                                        >
                                            Live
                                        </Badge>
                                    }
                                />
                                <ul className="stagger divide-y divide-border/60">
                                    {recentActivity.map((entry) => (
                                        <li
                                            key={entry.id}
                                            className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30 sm:px-6"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-mono text-xs font-medium text-foreground">
                                                    {entry.action}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    by{' '}
                                                    {entry.user?.name ??
                                                        'System'}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-xs font-medium text-muted-foreground/80 tabular-nums">
                                                {formatActivityTime(
                                                    entry.created_at,
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </SectionCard>
                        )}
                    </div>
                </div>
            </PageContainer>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
