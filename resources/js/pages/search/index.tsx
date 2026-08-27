import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    FilePlus2,
    FileText,
    HelpCircle,
    MapPin,
    Search as SearchIcon,
    TriangleAlert,
} from 'lucide-react';
import type { ComponentType, FormEvent, SVGProps } from 'react';
import { useState } from 'react';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import {
    SectionCard,
    SectionCardBody,
    SectionCardHeader,
} from '@/components/section-card';
import StatusBadge from '@/components/status-badge';
import TypeaheadInput from '@/components/typeahead-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { cn } from '@/lib/utils';
import documents from '@/routes/documents';
import search from '@/routes/search';

type BusinessItem = { id: number; name: string };
type Named = { id: number; name: string };

type DocumentItem = {
    id: number;
    reference: string;
    title: string | null;
    approval_date?: string | null;
    request_date?: string | null;
    request_type?: Named | null;
    storage_location?: Named | null;
};

type BranchItem = {
    id: number;
    location: string;
    business: BusinessItem;
    documents: DocumentItem[];
};

type SearchState = 'found' | 'known_no_documents' | 'unknown';

type SearchResult = {
    state: SearchState;
    business: BusinessItem | null;
    documents: DocumentItem[];
    search_log_id: number | null;
};

type Filters = {
    business: string;
    business_id: number | null;
    branch_id: number | null;
    request_type_id: number | null;
    location: string;
};

const stateCopy: Record<
    SearchState,
    {
        title: string;
        body: string;
        panel: string;
        chip: string;
        icon: ComponentType<SVGProps<SVGSVGElement>>;
        tone: 'success' | 'warning' | 'neutral';
    }
> = {
    found: {
        title: 'Scans indexed and ready',
        body: 'The documents below are already digitised. Open one to read, download, or print it without walking to storage.',
        panel: 'border-success/35 bg-success-muted/50',
        chip: 'bg-success/20 text-success',
        icon: CheckCircle2,
        tone: 'success',
    },
    known_no_documents: {
        title: 'Known business — no scans indexed yet',
        body: 'This business is registered, but its files are still only on paper in the storage archives. Fetch the paper, and scan it in while you have it in hand.',
        panel: 'border-warning/40 bg-warning-muted/60',
        chip: 'bg-warning/20 text-warning-foreground',
        icon: TriangleAlert,
        tone: 'warning',
    },
    unknown: {
        title: 'Not in the registered index',
        body: 'This is not a denial of existence. The business may be archived under an older ledger or an alternate spelling — try the address search instead.',
        panel: 'border-border/80 bg-muted/40',
        chip: 'bg-foreground/10 text-muted-foreground',
        icon: HelpCircle,
        tone: 'neutral',
    },
};

function documentLinkUrl(reference: string, searchLogId: number | null) {
    return documents.show.url(reference, {
        query: searchLogId !== null ? { search_log: searchLogId } : undefined,
    });
}

function mainDate(document: DocumentItem): string {
    const date = document.approval_date ?? document.request_date;

    return date ? date.slice(0, 10) : 'No date';
}

function DocumentRow({
    document,
    searchLogId,
}: {
    document: DocumentItem;
    searchLogId: number | null;
}) {
    return (
        <Link
            href={documentLinkUrl(document.reference, searchLogId)}
            className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
        >
            <div className="min-w-0 space-y-1">
                <span className="block truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {document.title ?? 'Untitled document'}
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[11px]">
                        {document.reference.slice(0, 10)}
                    </span>
                    <span aria-hidden>·</span>
                    <span>
                        {document.request_type?.name ?? 'General request'}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="tabular-nums">{mainDate(document)}</span>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                <StatusBadge
                    tone="info"
                    icon={<MapPin aria-hidden className="size-3" />}
                    className="hidden sm:inline-flex"
                >
                    {document.storage_location?.name ?? 'Unknown location'}
                </StatusBadge>
                <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
        </Link>
    );
}

export default function SearchIndex({
    result,
    locationResults,
    locationSearchLogId,
    businesses,
    branches,
    requestTypes,
    filters,
}: {
    result: SearchResult | null;
    locationResults: BranchItem[] | null;
    locationSearchLogId: number | null;
    businesses: BusinessItem[];
    branches: { id: number; location: string }[];
    requestTypes: Named[];
    filters: Filters;
}) {
    const { auth } = usePage().props;
    const canUpload =
        auth.user?.role === 'editor' || auth.user?.role === 'admin';

    const [business, setBusiness] = useState(
        filters.business || (result?.business?.name ?? ''),
    );
    const [businessId, setBusinessId] = useState<number | null>(
        filters.business_id,
    );
    const [location, setLocation] = useState(filters.location);

    function searchByBusiness(event: FormEvent) {
        event.preventDefault();

        const query: Record<string, string | number> = {};

        if (businessId !== null) {
            query.business_id = businessId;
        } else if (business.trim() !== '') {
            query.business = business.trim();
        }

        router.get(search.index.url(), query, { preserveState: true });
    }

    function narrow(key: string, value: string) {
        const query: Record<string, string | number> = {};

        if (filters.business_id !== null) {
            query.business_id = filters.business_id;
        } else if (filters.business !== '') {
            query.business = filters.business;
        }

        if (key !== 'branch_id' && filters.branch_id !== null) {
            query.branch_id = filters.branch_id;
        }

        if (key !== 'request_type_id' && filters.request_type_id !== null) {
            query.request_type_id = filters.request_type_id;
        }

        if (value !== '') {
            query[key] = value;
        }

        router.get(search.index.url(), query, { preserveState: true });
    }

    function searchByLocation(event: FormEvent) {
        event.preventDefault();
        router.get(search.index.url(), { location }, { preserveState: true });
    }

    const verdict = result ? stateCopy[result.state] : null;
    const VerdictIcon = verdict?.icon;

    return (
        <>
            <Head title="Search Archive" />
            <PageContainer>
                <PageHeader
                    title="Find a Document"
                    icon={SearchIcon}
                    description="Start from the business a request is about — or from the physical address, when the property is known but the owner is not."
                />

                <div className="grid gap-6 lg:grid-cols-2">
                    <SectionCard>
                        <SectionCardHeader
                            title="Search by business"
                            description="Primary lookup for registered businesses and corporations."
                            icon={Building2}
                        />
                        <SectionCardBody>
                            <form
                                onSubmit={searchByBusiness}
                                className="grid gap-4"
                            >
                                <div className="grid gap-1.5">
                                    <Label
                                        htmlFor="business"
                                        className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                    >
                                        Business name
                                    </Label>
                                    <TypeaheadInput
                                        id="business"
                                        options={businesses.map((item) => ({
                                            id: item.id,
                                            label: item.name,
                                        }))}
                                        value={business}
                                        selectedId={businessId}
                                        onChange={setBusiness}
                                        onSelect={(option) =>
                                            setBusinessId(option?.id ?? null)
                                        }
                                        allowCreate={false}
                                        placeholder="Type a registered business name…"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="justify-self-start"
                                >
                                    <SearchIcon className="size-4" />
                                    Search business
                                </Button>
                            </form>
                        </SectionCardBody>
                    </SectionCard>

                    <SectionCard>
                        <SectionCardHeader
                            title="Search by address"
                            description="Secondary lookup for a street name or building landmark."
                            icon={MapPin}
                        />
                        <SectionCardBody>
                            <form
                                onSubmit={searchByLocation}
                                className="grid gap-4"
                            >
                                <div className="grid gap-1.5">
                                    <Label
                                        htmlFor="location"
                                        className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                    >
                                        Address or location keyword
                                    </Label>
                                    <Input
                                        id="location"
                                        value={location}
                                        onChange={(event) =>
                                            setLocation(event.target.value)
                                        }
                                        placeholder="e.g. Rizal St, Building 4, Annex…"
                                        className="bg-card"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="justify-self-start"
                                >
                                    <SearchIcon className="size-4" />
                                    Search by address
                                </Button>
                            </form>
                        </SectionCardBody>
                    </SectionCard>
                </div>

                {result && verdict && VerdictIcon && (
                    <SectionCard aria-live="polite" className="animate-rise">
                        <div
                            className={cn(
                                'flex items-start gap-4 border-b px-5 py-5 sm:px-6',
                                verdict.panel,
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                                    verdict.chip,
                                )}
                            >
                                <VerdictIcon aria-hidden className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <StatusBadge tone={verdict.tone} dot>
                                    {verdict.title}
                                </StatusBadge>
                                <h2 className="truncate text-xl font-bold tracking-tight text-foreground">
                                    {result.business?.name ??
                                        filters.business ??
                                        'Queried business'}
                                </h2>
                                <p className="text-xs leading-relaxed text-pretty text-foreground/80">
                                    {verdict.body}
                                </p>
                            </div>
                        </div>

                        {result.state === 'found' && (
                            <SectionCardBody className="space-y-5">
                                <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border/80 bg-muted/20 p-4">
                                    <div className="grid min-w-48 gap-1.5">
                                        <Label
                                            htmlFor="branch_filter"
                                            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                        >
                                            Narrow branch
                                        </Label>
                                        <NativeSelect
                                            id="branch_filter"
                                            value={filters.branch_id ?? ''}
                                            onChange={(event) =>
                                                narrow(
                                                    'branch_id',
                                                    event.target.value,
                                                )
                                            }
                                            className="bg-card"
                                        >
                                            <option value="">
                                                All branches ({branches.length})
                                            </option>
                                            {branches.map((branch) => (
                                                <option
                                                    key={branch.id}
                                                    value={branch.id}
                                                >
                                                    {branch.location}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </div>

                                    <div className="grid min-w-48 gap-1.5">
                                        <Label
                                            htmlFor="type_filter"
                                            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                                        >
                                            Narrow request type
                                        </Label>
                                        <NativeSelect
                                            id="type_filter"
                                            value={
                                                filters.request_type_id ?? ''
                                            }
                                            onChange={(event) =>
                                                narrow(
                                                    'request_type_id',
                                                    event.target.value,
                                                )
                                            }
                                            className="bg-card"
                                        >
                                            <option value="">
                                                All request types
                                            </option>
                                            {requestTypes.map((type) => (
                                                <option
                                                    key={type.id}
                                                    value={type.id}
                                                >
                                                    {type.name}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </div>

                                    <p className="ml-auto self-end text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground tabular-nums">
                                            {result.documents.length}
                                        </span>{' '}
                                        matching record
                                        {result.documents.length === 1
                                            ? ''
                                            : 's'}
                                    </p>
                                </div>

                                <ul className="stagger divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card">
                                    {result.documents.map((document) => (
                                        <li key={document.id}>
                                            <DocumentRow
                                                document={document}
                                                searchLogId={
                                                    result.search_log_id
                                                }
                                            />
                                        </li>
                                    ))}
                                </ul>

                                <p className="text-xs text-muted-foreground">
                                    Sorted by document approval date, newest
                                    first.
                                </p>
                            </SectionCardBody>
                        )}

                        {result.state !== 'found' && canUpload && (
                            <SectionCardBody className="border-t border-border/60 bg-muted/10">
                                <Button asChild>
                                    <Link
                                        href={documents.create.url({
                                            query:
                                                filters.branch_id !== null
                                                    ? {
                                                          branch_id:
                                                              filters.branch_id,
                                                      }
                                                    : undefined,
                                        })}
                                    >
                                        <FilePlus2 className="size-4" />
                                        Scan and encode it now
                                    </Link>
                                </Button>
                            </SectionCardBody>
                        )}
                    </SectionCard>
                )}

                {locationResults && (
                    <SectionCard className="animate-rise">
                        <SectionCardHeader
                            title={`Branches matching "${filters.location}"`}
                            description="Every registered premises whose address contains the keyword."
                            icon={MapPin}
                            actions={
                                <Badge
                                    variant="secondary"
                                    className="rounded-full"
                                >
                                    {locationResults.length} branch
                                    {locationResults.length === 1 ? '' : 'es'}
                                </Badge>
                            }
                        />

                        {locationResults.length === 0 ? (
                            <p className="px-5 py-10 text-center text-sm text-muted-foreground sm:px-6">
                                No registered branch matches this address. Check
                                the physical records or the older ledgers.
                            </p>
                        ) : (
                            <ul className="stagger divide-y divide-border/60">
                                {locationResults.map((branch) => (
                                    <li
                                        key={branch.id}
                                        className="space-y-3 px-5 py-5 sm:px-6"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <span className="font-semibold text-foreground">
                                                {branch.business.name}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <MapPin className="size-3" />
                                                {branch.location}
                                            </span>
                                        </div>

                                        {branch.documents.length === 0 ? (
                                            <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
                                                <p>
                                                    No scans are encoded for
                                                    this location yet — the
                                                    files sit in physical
                                                    archives.
                                                </p>
                                                {canUpload && (
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={documents.create.url(
                                                                {
                                                                    query: {
                                                                        branch_id:
                                                                            branch.id,
                                                                    },
                                                                },
                                                            )}
                                                        >
                                                            <FilePlus2 className="size-3.5" />
                                                            Encode a document
                                                            here
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border bg-card">
                                                {branch.documents.map(
                                                    (document) => (
                                                        <li key={document.id}>
                                                            <Link
                                                                href={documentLinkUrl(
                                                                    document.reference,
                                                                    locationSearchLogId,
                                                                )}
                                                                className="group flex items-center justify-between gap-3 px-4 py-3 text-xs transition-colors hover:bg-muted/40"
                                                            >
                                                                <span className="flex min-w-0 items-center gap-2">
                                                                    <FileText className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                                                                    <span className="truncate font-medium text-foreground">
                                                                        {document.title ??
                                                                            'Untitled document'}
                                                                    </span>
                                                                </span>
                                                                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                                                    {mainDate(
                                                                        document,
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SectionCard>
                )}
            </PageContainer>
        </>
    );
}

SearchIndex.layout = {
    breadcrumbs: [{ title: 'Search', href: search.index() }],
};
