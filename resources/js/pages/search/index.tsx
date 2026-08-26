import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CircleCheck,
    CircleHelp,
    FileText,
    MapPin,
    Search as SearchIcon,
    TriangleAlert,
    Upload,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import TypeaheadInput from '@/components/typeahead-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
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

/**
 * The three states a search can end in (PLAN.md 6.1), each carrying its own
 * colour so the answer is legible before a word is read. There is no fourth,
 * blank state: the system never tells staff a document does not exist.
 */
const stateCopy: Record<
    SearchState,
    {
        title: string;
        body: string;
        panel: string;
        chip: string;
        icon: typeof CircleCheck;
    }
> = {
    found: {
        title: 'Found',
        body: 'Open one to read it, print it, or see where the paper original is.',
        panel: 'border-success/30 bg-success-muted',
        chip: 'bg-success/15 text-success',
        icon: CircleCheck,
    },
    known_no_documents: {
        title: 'Known business — nothing encoded yet',
        body: 'The business is real and its papers are physical. Go to the room or the central storage building — and scan it in while you are there.',
        panel: 'border-warning/35 bg-warning-muted',
        chip: 'bg-warning/20 text-warning-foreground',
        icon: TriangleAlert,
    },
    unknown: {
        title: 'Not in the known list',
        body: 'This is not a denial. The business may be older or inactive — check the ledger.',
        panel: 'border-border bg-muted/50',
        chip: 'bg-foreground/10 text-muted-foreground',
        icon: CircleHelp,
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

    // Searching by id leaves the typed query empty; show the business the
    // search actually resolved to so the field still reflects the results.
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

    return (
        <>
            <Head title="Search" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Find a document"
                    description="Start from the business a request is about — or from the address, when the building is known but the owner is not."
                />

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-xl border border-border bg-card">
                        <header className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                <Building2 className="size-4" />
                            </span>
                            <div>
                                <h2 className="font-semibold">
                                    Search by business
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    The order already in the clerk&rsquo;s head.
                                </p>
                            </div>
                        </header>
                        <form
                            onSubmit={searchByBusiness}
                            className="grid gap-3 p-5"
                        >
                            <div className="grid gap-1.5">
                                <Label htmlFor="business">Business name</Label>
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
                                    placeholder="Start typing a business name"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="justify-self-start"
                            >
                                <SearchIcon />
                                Search
                            </Button>
                        </form>
                    </section>

                    <section className="rounded-xl border border-border bg-card">
                        <header className="flex items-center gap-2.5 border-b border-border px-5 py-4">
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                <MapPin className="size-4" />
                            </span>
                            <div>
                                <h2 className="font-semibold">
                                    Search by address
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    &ldquo;The building on Rizal St.&rdquo;
                                </p>
                            </div>
                        </header>
                        <form
                            onSubmit={searchByLocation}
                            className="grid gap-3 p-5"
                        >
                            <div className="grid gap-1.5">
                                <Label htmlFor="location">
                                    Address or location
                                </Label>
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(event) =>
                                        setLocation(event.target.value)
                                    }
                                    placeholder="e.g. Rizal St"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="outline"
                                className="justify-self-start"
                            >
                                <SearchIcon />
                                Search by address
                            </Button>
                        </form>
                    </section>
                </div>

                {result && (
                    <section
                        aria-live="polite"
                        className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                        {/*
                         * The verdict gets the colour; the results underneath
                         * stay on the card so a long list is still easy to
                         * read.
                         */}
                        <div
                            className={`flex items-start gap-3 border-b p-5 ${stateCopy[result.state].panel}`}
                        >
                            <span
                                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stateCopy[result.state].chip}`}
                            >
                                {(() => {
                                    const StateIcon =
                                        stateCopy[result.state].icon;

                                    return (
                                        <StateIcon
                                            aria-hidden
                                            className="size-5"
                                        />
                                    );
                                })()}
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-medium tracking-wide uppercase opacity-70">
                                    {stateCopy[result.state].title}
                                </p>
                                <h2 className="mt-0.5 truncate text-lg font-semibold">
                                    {result.business?.name ??
                                        filters.business ??
                                        'This business'}
                                </h2>
                                <p className="mt-1 text-sm text-pretty text-muted-foreground">
                                    {stateCopy[result.state].body}
                                </p>
                            </div>
                        </div>

                        {result.state === 'found' && (
                            <div className="p-5">
                                <div className="flex flex-wrap gap-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="branch_filter">
                                            Narrow to a branch
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
                                        >
                                            <option value="">
                                                All branches
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

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="type_filter">
                                            Narrow to a request type
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
                                        >
                                            <option value="">All types</option>
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
                                </div>

                                <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
                                    {result.documents.map((document) => (
                                        <li key={document.id}>
                                            <Link
                                                href={documentLinkUrl(
                                                    document.reference,
                                                    result.search_log_id,
                                                )}
                                                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50"
                                            >
                                                <span className="min-w-0">
                                                    <span className="block truncate font-medium">
                                                        {document.title ??
                                                            'Untitled'}
                                                    </span>
                                                    <span className="block text-xs text-muted-foreground">
                                                        {document.request_type
                                                            ?.name ??
                                                            'No type'}{' '}
                                                        &middot;{' '}
                                                        {mainDate(document)}
                                                    </span>
                                                </span>
                                                <span className="flex shrink-0 items-center gap-2">
                                                    <StatusBadge
                                                        tone="info"
                                                        icon={
                                                            <MapPin
                                                                aria-hidden
                                                                className="size-3"
                                                            />
                                                        }
                                                    >
                                                        {document
                                                            .storage_location
                                                            ?.name ?? 'Unknown'}
                                                    </StatusBadge>
                                                    <ArrowRight className="size-4 text-muted-foreground" />
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                                <p className="mt-3 text-xs text-muted-foreground">
                                    Sorted by the document&rsquo;s own date —
                                    approval first, request date where there is
                                    no approval. Scroll to the year you want.
                                </p>
                            </div>
                        )}

                        {result.state !== 'found' && canUpload && (
                            <div className="p-5">
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
                                        <Upload />
                                        Scan it in while you have it
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </section>
                )}

                {locationResults && (
                    <section className="rounded-xl border border-border bg-card">
                        <header className="border-b border-border px-5 py-4">
                            <h2 className="font-semibold">
                                Branches matching &ldquo;{filters.location}
                                &rdquo;
                            </h2>
                        </header>

                        {locationResults.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-muted-foreground">
                                No known branch matches this address — that is
                                not a denial. Check the ledger.
                            </p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {locationResults.map((branch) => (
                                    <li key={branch.id} className="px-5 py-4">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <span className="font-medium">
                                                {branch.business.name}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {branch.location}
                                            </span>
                                        </div>

                                        {branch.documents.length === 0 ? (
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                <p>
                                                    Nothing encoded yet — go to
                                                    the room or the storage
                                                    building.
                                                </p>
                                                {canUpload && (
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
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
                                                            <Upload />
                                                            Scan it in
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                                                {branch.documents.map(
                                                    (document) => (
                                                        <li key={document.id}>
                                                            <Link
                                                                href={documentLinkUrl(
                                                                    document.reference,
                                                                    locationSearchLogId,
                                                                )}
                                                                className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-muted/50"
                                                            >
                                                                <span className="flex min-w-0 items-center gap-2">
                                                                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                                                                    <span className="truncate">
                                                                        {document.title ??
                                                                            'Untitled'}
                                                                    </span>
                                                                </span>
                                                                <span className="shrink-0 text-xs text-muted-foreground">
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
                    </section>
                )}
            </div>
        </>
    );
}

SearchIndex.layout = {
    breadcrumbs: [{ title: 'Search', href: search.index() }],
};
