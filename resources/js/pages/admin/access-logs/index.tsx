import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, Filter, Printer, User, X } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import EmptyState from '@/components/empty-state';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import type { Paginated } from '@/components/paginator';
import Paginator from '@/components/paginator';
import {
    SectionCard,
    SectionCardHeader,
    SectionToolbar,
} from '@/components/section-card';
import type { StatusTone } from '@/components/status-badge';
import StatusBadge from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import admin from '@/routes/admin';
import documents from '@/routes/documents';

type AccessAction = 'view' | 'download' | 'print';

type AccessLogRow = {
    id: number;
    action: AccessAction;
    created_at: string;
    user?: { id: number; name: string } | null;
    document?: {
        reference: string;
        title: string | null;
        branch?: {
            location: string;
            business?: { name: string } | null;
        } | null;
    } | null;
};

type Filters = {
    action: AccessAction | null;
    user_id: number | null;
    reference: string | null;
    per_page: number;
};

const toneByAction: Record<AccessAction, StatusTone> = {
    view: 'info',
    download: 'warning',
    print: 'primary',
};

const actionIcons: Record<
    AccessAction,
    ComponentType<SVGProps<SVGSVGElement>>
> = {
    view: Eye,
    download: Download,
    print: Printer,
};

const actions: AccessAction[] = ['view', 'download', 'print'];

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

export default function AccessLogIndex({
    accessLogs,
    users,
    filters,
}: {
    accessLogs: Paginated<AccessLogRow>;
    users: { id: number; name: string }[];
    filters: Filters;
}) {
    const hasFilters =
        filters.action !== null ||
        filters.user_id !== null ||
        filters.reference !== null;

    function applyFilters(overrides: Record<string, string | number | null>) {
        const merged: Record<string, string | number | null> = {
            action: filters.action,
            user_id: filters.user_id,
            reference: filters.reference,
            ...overrides,
        };

        const next: Record<string, string | number> = {};

        for (const [key, value] of Object.entries(merged)) {
            if (value !== null && value !== '') {
                next[key] = value;
            }
        }

        router.get(admin.accessLogs.index.url(), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    return (
        <>
            <Head title="Access Log" />
            <PageContainer width="full">
                <PageHeader
                    title="Document Access Log"
                    icon={Eye}
                    description="Every file view, PDF download, and label export. Plain index queries that retrieved no payload are omitted, so the log stays readable."
                    badge={
                        <Badge
                            variant="secondary"
                            className="rounded-full font-mono text-[11px]"
                        >
                            {accessLogs.total} event
                            {accessLogs.total === 1 ? '' : 's'}
                        </Badge>
                    }
                />

                <SectionCard>
                    <SectionCardHeader
                        title="Filters"
                        description="Narrow by action, by staff member, or to one document."
                        icon={Filter}
                        actions={
                            hasFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        applyFilters({
                                            action: null,
                                            user_id: null,
                                            reference: null,
                                        })
                                    }
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-3.5" />
                                    Clear filters
                                </Button>
                            )
                        }
                    />

                    <SectionToolbar>
                        <div className="grid min-w-44 gap-1.5">
                            <Label
                                htmlFor="action"
                                className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                Access action
                            </Label>
                            <NativeSelect
                                id="action"
                                value={filters.action ?? ''}
                                onChange={(event) =>
                                    applyFilters({
                                        action: event.target.value || null,
                                    })
                                }
                                className="bg-card"
                            >
                                <option value="">Any action</option>
                                {actions.map((action) => (
                                    <option key={action} value={action}>
                                        {action.charAt(0).toUpperCase() +
                                            action.slice(1)}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>

                        <div className="grid min-w-48 gap-1.5">
                            <Label
                                htmlFor="user_id"
                                className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                            >
                                Staff member
                            </Label>
                            <NativeSelect
                                id="user_id"
                                value={filters.user_id ?? ''}
                                onChange={(event) =>
                                    applyFilters({
                                        user_id: event.target.value || null,
                                    })
                                }
                                className="bg-card"
                            >
                                <option value="">All staff</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>

                        {filters.reference !== null && (
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Scoped to document
                                </Label>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        applyFilters({ reference: null })
                                    }
                                >
                                    <X className="size-3.5" />
                                    <span className="font-mono text-xs">
                                        {filters.reference}
                                    </span>
                                </Button>
                            </div>
                        )}
                    </SectionToolbar>

                    {accessLogs.data.length === 0 ? (
                        <EmptyState
                            icon={Eye}
                            title={
                                hasFilters
                                    ? 'No access logs match these filters'
                                    : 'No documents accessed yet'
                            }
                            description="Records appear whenever staff inspect, download, or print a scanned file."
                        />
                    ) : (
                        <div className="scroll-slim overflow-x-auto">
                            <Table>
                                <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-52 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-6">
                                            Accessed at
                                        </TableHead>
                                        <TableHead className="w-44 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Staff user
                                        </TableHead>
                                        <TableHead className="w-36 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Action
                                        </TableHead>
                                        <TableHead className="px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-6">
                                            Document
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="stagger">
                                    {accessLogs.data.map((entry) => {
                                        const Icon =
                                            actionIcons[entry.action] ?? Eye;

                                        return (
                                            <TableRow
                                                key={entry.id}
                                                className="border-border/60 transition-colors hover:bg-muted/30"
                                            >
                                                <TableCell className="px-5 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums sm:px-6">
                                                    {formatTimestamp(
                                                        entry.created_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="size-3 shrink-0 text-muted-foreground" />
                                                        <span className="truncate">
                                                            {entry.user?.name ??
                                                                'Deleted account'}
                                                        </span>
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        tone={
                                                            toneByAction[
                                                                entry.action
                                                            ]
                                                        }
                                                        icon={
                                                            <Icon className="size-3" />
                                                        }
                                                        className="capitalize"
                                                    >
                                                        {entry.action}
                                                    </StatusBadge>
                                                </TableCell>
                                                <TableCell className="px-5 py-3 sm:px-6">
                                                    {entry.document ? (
                                                        <Link
                                                            href={documents.show(
                                                                entry.document
                                                                    .reference,
                                                            )}
                                                            className="group block min-w-0 space-y-0.5"
                                                        >
                                                            <span className="block truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                                                                {entry.document
                                                                    .title ??
                                                                    'Untitled document'}
                                                            </span>
                                                            <span className="block truncate text-[11px] text-muted-foreground">
                                                                {entry.document
                                                                    .branch
                                                                    ?.business
                                                                    ?.name ??
                                                                    'Unknown business'}
                                                                {' · '}
                                                                {entry.document
                                                                    .branch
                                                                    ?.location ??
                                                                    'No branch'}
                                                                {' · '}
                                                                <span className="font-mono text-[10px]">
                                                                    {
                                                                        entry
                                                                            .document
                                                                            .reference
                                                                    }
                                                                </span>
                                                            </span>
                                                        </Link>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            Purged document
                                                            record
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <Paginator
                        page={accessLogs}
                        noun="entry"
                        plural="entries"
                    />
                </SectionCard>
            </PageContainer>
        </>
    );
}

AccessLogIndex.layout = {
    breadcrumbs: [{ title: 'Access Log', href: admin.accessLogs.index() }],
};
