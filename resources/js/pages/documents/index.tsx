import { Head, Link, router } from '@inertiajs/react';
import { FileText, Filter, MapPin, Plus, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import EmptyState from '@/components/empty-state';
import FlashMessage from '@/components/flash-message';
import PageHeader from '@/components/page-header';
import type { Paginated } from '@/components/paginator';
import Paginator from '@/components/paginator';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
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

    const hasFilters =
        filters.query !== '' ||
        filters.branch_id !== null ||
        filters.request_type_id !== null ||
        filters.storage_location_id !== null;

    function applyFilters(overrides: Record<string, string | number | null>) {
        const next: Record<string, string | number> = {};
        const merged = {
            query,
            branch_id: filters.branch_id,
            request_type_id: filters.request_type_id,
            storage_location_id: filters.storage_location_id,
            ...overrides,
        };

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
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Document archive"
                    description="Every scanned document the office has indexed, newest by its own approval date first."
                    actions={
                        can.encode && (
                            <Button asChild>
                                <Link href={documents.create()}>
                                    <Plus />
                                    Encode a document
                                </Link>
                            </Button>
                        )
                    }
                />

                <FlashMessage />

                <section className="rounded-xl border border-border bg-card">
                    <form
                        onSubmit={submit}
                        className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-5"
                    >
                        <div className="grid gap-1.5 lg:col-span-2">
                            <Label htmlFor="query">
                                Title, business or address
                            </Label>
                            <Input
                                id="query"
                                name="query"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="e.g. setback inspection"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="branch_id">Branch</Label>
                            <NativeSelect
                                id="branch_id"
                                value={filters.branch_id ?? ''}
                                onChange={(event) =>
                                    applyFilters({
                                        branch_id: event.target.value || null,
                                    })
                                }
                            >
                                <option value="">All branches</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.business?.name
                                            ? `${branch.business.name} — ${branch.location}`
                                            : branch.location}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="request_type_id">
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
                            <Label htmlFor="storage_location_id">
                                Physical location
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

                        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
                            <Button type="submit" size="sm">
                                <Filter />
                                Apply filters
                            </Button>
                            {hasFilters && (
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
                                >
                                    <X />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </form>

                    {page.data.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title={
                                hasFilters
                                    ? 'Nothing matches these filters'
                                    : 'The index is empty'
                            }
                            description={
                                hasFilters
                                    ? 'Widen the search — this is not a statement that the document does not exist, only that nothing encoded matches.'
                                    : 'Documents appear here as staff scan and encode them. The archive fills through the retrieval workflow itself.'
                            }
                            action={
                                can.encode && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={documents.create()}>
                                            Encode the first document
                                        </Link>
                                    </Button>
                                )
                            }
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Business / branch</TableHead>
                                    <TableHead>Request type</TableHead>
                                    <TableHead>Main date</TableHead>
                                    <TableHead>Paper is at</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {page.data.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <Link
                                                href={documents.show(
                                                    row.reference,
                                                )}
                                                className="font-medium hover:underline"
                                            >
                                                {row.title ?? 'Untitled'}
                                            </Link>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {row.reference.slice(0, 8)}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <span className="block">
                                                {row.branch?.business?.name ??
                                                    'Unknown business'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {row.branch?.location ??
                                                    'No branch'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {row.request_type?.name ?? '—'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap tabular-nums">
                                            {mainDate(row)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                tone="info"
                                                icon={
                                                    <MapPin
                                                        aria-hidden
                                                        className="size-3"
                                                    />
                                                }
                                            >
                                                {row.storage_location?.name ??
                                                    'Unknown'}
                                            </StatusBadge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    <Paginator page={page} noun="document" />
                </section>
            </div>
        </>
    );
}

DocumentIndex.layout = {
    breadcrumbs: [{ title: 'Documents', href: documents.index() }],
};
