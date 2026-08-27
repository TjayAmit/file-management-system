import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    Copy,
    FilePlus2,
    FileText,
    Filter,
    MapPin,
    QrCode,
    Search,
    Tag,
    X,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import StatusBadge from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
import documents from '@/routes/documents';

type Named = { id: number; name: string };
type BranchOption = {
    id: number;
    location: string;
    business?: { id: number; name: string } | null;
};

type DocumentRow = {
    id: number;
    reference: string;
    title: string | null;
    approval_date: string | null;
    request_date: string | null;
    scan_date: string | null;
    branch?: BranchOption | null;
    request_type?: Named | null;
    storage_location?: Named | null;
};

type Filters = {
    query: string;
    branch_id: number | null;
    request_type_id: number | null;
    storage_location_id: number | null;
    per_page: number;
};

/** Matches the sheet cap in QrLabelsRequest — one printable page of labels. */
const LABEL_SHEET_LIMIT = 60;

function mainDate(row: DocumentRow): string {
    const date = row.approval_date ?? row.request_date;

    return date ? date.slice(0, 10) : 'No date on file';
}

export default function DocumentIndex({
    documents: page,
    branches,
    requestTypes,
    storageLocations,
    filters,
    can,
}: {
    documents: Paginated<DocumentRow>;
    branches: BranchOption[];
    requestTypes: Named[];
    storageLocations: Named[];
    filters: Filters;
    can: { encode: boolean };
}) {
    const [query, setQuery] = useState(filters.query);
    const [selected, setSelected] = useState<string[]>([]);

    const pageReferences = page.data.map((row) => row.reference);
    const allOnPageSelected =
        pageReferences.length > 0 &&
        pageReferences.every((reference) => selected.includes(reference));

    const labelHref = documents.qrLabels.url({
        query: { references: selected.slice(0, LABEL_SHEET_LIMIT) },
    });

    function toggle(reference: string, checked: boolean) {
        setSelected((current) =>
            checked
                ? [...current, reference]
                : current.filter((item) => item !== reference),
        );
    }

    function togglePage(checked: boolean) {
        setSelected((current) =>
            checked
                ? Array.from(new Set([...current, ...pageReferences]))
                : current.filter(
                      (reference) => !pageReferences.includes(reference),
                  ),
        );
    }

    function copyReference(reference: string) {
        navigator.clipboard
            .writeText(reference)
            .then(() => toast.success('Reference copied to clipboard'))
            .catch(() => toast.error('Could not reach the clipboard'));
    }

    const hasFilters =
        filters.query !== '' ||
        filters.branch_id !== null ||
        filters.request_type_id !== null ||
        filters.storage_location_id !== null;

    function applyFilters(overrides: Record<string, string | number | null>) {
        const merged = {
            query,
            branch_id: filters.branch_id,
            request_type_id: filters.request_type_id,
            storage_location_id: filters.storage_location_id,
            ...overrides,
        };

        const next: Record<string, string | number> = {};

        for (const [key, value] of Object.entries(merged)) {
            if (value !== null && value !== '') {
                next[key] = value;
            }
        }

        router.get(documents.index.url(), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        applyFilters({});
    }

    return (
        <>
            <Head title="Documents" />
            <PageContainer width="full">
                <PageHeader
                    title="Document Archive"
                    icon={FileText}
                    description="Every scanned document the office has indexed, newest by its own approval date first."
                    badge={
                        <Badge variant="secondary" className="rounded-full">
                            {page.total} document
                            {page.total === 1 ? '' : 's'}
                        </Badge>
                    }
                    actions={
                        can.encode && (
                            <Button asChild>
                                <Link href={documents.create()} prefetch>
                                    <FilePlus2 className="size-4" />
                                    Encode document
                                </Link>
                            </Button>
                        )
                    }
                />

                <SectionCard>
                    <SectionCardHeader
                        title="Filters"
                        description="Narrow by business, classification, or where the paper is kept."
                        icon={Filter}
                        actions={
                            hasFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setQuery('');
                                        router.get(
                                            documents.index.url(),
                                            {},
                                            { replace: true },
                                        );
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-3.5" />
                                    Clear filters
                                </Button>
                            )
                        }
                    />

                    <SectionToolbar>
                        <form
                            onSubmit={submit}
                            className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
                        >
                            <div className="grid gap-1.5 lg:col-span-2">
                                <Label
                                    htmlFor="query"
                                    className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                >
                                    Title, business, or address
                                </Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="query"
                                        name="query"
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder="Search the archive…"
                                        className="bg-card pl-9"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="branch_id"
                                    className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                >
                                    Branch
                                </Label>
                                <NativeSelect
                                    id="branch_id"
                                    value={filters.branch_id ?? ''}
                                    onChange={(event) =>
                                        applyFilters({
                                            branch_id:
                                                event.target.value || null,
                                        })
                                    }
                                    className="bg-card"
                                >
                                    <option value="">All branches</option>
                                    {branches.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.business?.name
                                                ? `${branch.business.name} — ${branch.location}`
                                                : branch.location}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>

                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="request_type_id"
                                    className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                >
                                    Request type
                                </Label>
                                <NativeSelect
                                    id="request_type_id"
                                    value={filters.request_type_id ?? ''}
                                    onChange={(event) =>
                                        applyFilters({
                                            request_type_id:
                                                event.target.value || null,
                                        })
                                    }
                                    className="bg-card"
                                >
                                    <option value="">All types</option>
                                    {requestTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>

                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="storage_location_id"
                                    className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                >
                                    Paper location
                                </Label>
                                <NativeSelect
                                    id="storage_location_id"
                                    value={filters.storage_location_id ?? ''}
                                    onChange={(event) =>
                                        applyFilters({
                                            storage_location_id:
                                                event.target.value || null,
                                        })
                                    }
                                    className="bg-card"
                                >
                                    <option value="">Anywhere</option>
                                    {storageLocations.map((location) => (
                                        <option
                                            key={location.id}
                                            value={location.id}
                                        >
                                            {location.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>

                            <div className="flex items-end sm:col-span-2 lg:col-span-4 xl:col-span-1">
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full xl:w-auto"
                                >
                                    <Filter className="size-4" />
                                    Apply
                                </Button>
                            </div>
                        </form>
                    </SectionToolbar>

                    {page.data.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title={
                                hasFilters
                                    ? 'No documents match these filters'
                                    : 'The archive index is empty'
                            }
                            description={
                                hasFilters
                                    ? 'Broaden the search, or clear the branch and location filters.'
                                    : 'Documents appear here as staff scan and encode them into the repository.'
                            }
                            action={
                                can.encode && (
                                    <Button asChild variant="outline">
                                        <Link href={documents.create()}>
                                            <FilePlus2 className="size-4" />
                                            Encode the first document
                                        </Link>
                                    </Button>
                                )
                            }
                        />
                    ) : (
                        <div className="scroll-slim overflow-x-auto">
                            <Table>
                                <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
                                    <TableRow className="hover:bg-transparent">
                                        {can.encode && (
                                            <TableHead className="w-12 px-5 sm:px-6">
                                                <Checkbox
                                                    aria-label="Select every document on this page"
                                                    checked={allOnPageSelected}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        togglePage(
                                                            checked === true,
                                                        )
                                                    }
                                                />
                                            </TableHead>
                                        )}
                                        <TableHead className="min-w-72 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Document
                                        </TableHead>
                                        <TableHead className="min-w-56 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Business / branch
                                        </TableHead>
                                        <TableHead className="min-w-40 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Request type
                                        </TableHead>
                                        <TableHead className="min-w-32 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Date
                                        </TableHead>
                                        <TableHead className="min-w-40 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:px-6">
                                            Paper location
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="stagger">
                                    {page.data.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                selected.includes(row.reference)
                                                    ? 'selected'
                                                    : undefined
                                            }
                                            className="group border-border/60 transition-colors hover:bg-muted/40 data-[state=selected]:bg-primary/[0.06]"
                                        >
                                            {can.encode && (
                                                <TableCell className="px-5 sm:px-6">
                                                    <Checkbox
                                                        aria-label={`Select ${row.title ?? 'untitled document'}`}
                                                        checked={selected.includes(
                                                            row.reference,
                                                        )}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            toggle(
                                                                row.reference,
                                                                checked ===
                                                                    true,
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell className="py-3.5">
                                                <div className="min-w-0 space-y-1">
                                                    <Link
                                                        href={documents.show(
                                                            row.reference,
                                                        )}
                                                        className="block truncate font-medium text-foreground transition-colors hover:text-primary hover:underline"
                                                    >
                                                        {row.title ??
                                                            'Untitled document'}
                                                    </Link>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                                                            {row.reference.slice(
                                                                0,
                                                                12,
                                                            )}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                copyReference(
                                                                    row.reference,
                                                                )
                                                            }
                                                            aria-label={`Copy reference for ${row.title ?? 'untitled document'}`}
                                                            title="Copy full reference"
                                                            className="rounded p-0.5 text-muted-foreground/60 opacity-0 transition-all group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100"
                                                        >
                                                            <Copy className="size-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex min-w-0 items-start gap-2">
                                                    <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                    <div className="min-w-0">
                                                        <span className="block truncate text-sm font-medium text-foreground">
                                                            {row.branch
                                                                ?.business
                                                                ?.name ??
                                                                'Unknown business'}
                                                        </span>
                                                        <span className="block truncate text-xs text-muted-foreground">
                                                            {row.branch
                                                                ?.location ??
                                                                'No branch assigned'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {row.request_type ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
                                                        <Tag className="size-3" />
                                                        {row.request_type.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                                                    <Calendar className="size-3.5 text-muted-foreground/70" />
                                                    {mainDate(row)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 sm:px-6">
                                                <StatusBadge
                                                    tone="info"
                                                    icon={
                                                        <MapPin
                                                            aria-hidden
                                                            className="size-3"
                                                        />
                                                    }
                                                >
                                                    {row.storage_location
                                                        ?.name ?? 'Unknown'}
                                                </StatusBadge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <Paginator page={page} noun="document" />
                </SectionCard>
            </PageContainer>

            {/*
             * The batch bar follows the viewport rather than the top of the
             * page: a clerk ticking labels forty rows down should not have to
             * scroll back up to find the button that acts on the ticks.
             */}
            {can.encode && selected.length > 0 && (
                <div className="pointer-events-none sticky bottom-0 z-30 flex justify-center px-4 pb-5">
                    <div className="animate-pop pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-2xl border border-primary/30 bg-popover/95 px-4 py-3 shadow-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground tabular-nums">
                                {selected.length}
                            </span>
                            <p className="text-sm font-medium text-foreground">
                                selected
                                {selected.length > LABEL_SHEET_LIMIT && (
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        (one sheet prints {LABEL_SHEET_LIMIT} at
                                        a time)
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button asChild size="sm">
                                <Link href={labelHref}>
                                    <QrCode className="size-3.5" />
                                    Print{' '}
                                    {Math.min(
                                        selected.length,
                                        LABEL_SHEET_LIMIT,
                                    )}{' '}
                                    QR label
                                    {Math.min(
                                        selected.length,
                                        LABEL_SHEET_LIMIT,
                                    ) === 1
                                        ? ''
                                        : 's'}
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelected([])}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3.5" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

DocumentIndex.layout = {
    breadcrumbs: [{ title: 'Documents', href: documents.index() }],
};
