import { Head, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import search from '@/routes/search';

interface DocumentItem {
    id: number;
    reference: string;
    title: string | null;
}

interface BusinessItem {
    id: number;
    name: string;
}

interface BranchItem {
    id: number;
    location: string;
    business: BusinessItem;
    documents: DocumentItem[];
}

type SearchState = 'found' | 'known_no_documents' | 'unknown';

interface SearchResult {
    state: SearchState;
    business: BusinessItem | null;
    documents: DocumentItem[];
}

interface Filters {
    business: string;
    business_id: number | null;
    branch_id: number | null;
    request_type_id: number | null;
    location: string;
}

const stateMessages: Record<SearchState, string> = {
    found: 'Documents encoded for this business.',
    known_no_documents:
        'This business is known, but nothing is encoded yet — go to the room or storage building.',
    unknown: 'Not in the known list — check the ledger.',
};

export default function SearchIndex({
    result,
    locationResults,
    filters,
}: {
    result: SearchResult | null;
    locationResults: BranchItem[] | null;
    filters: Filters;
}) {
    const [location, setLocation] = useState(filters.location);

    function handleLocationSearch(e: FormEvent) {
        e.preventDefault();
        router.get(search.index.url(), { location }, { preserveState: true });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Search', href: '/search' }]}>
            <Head title="Search" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">Search</h1>
                {filters.business === '' && !filters.business_id && (
                    <p className="text-muted-foreground">
                        Search for a business to find its documents.
                    </p>
                )}
                {result && (
                    <div className="rounded-lg border p-4">
                        <p className="font-medium">
                            {stateMessages[result.state]}
                        </p>
                        {result.state === 'found' && (
                            <ul className="mt-2 divide-y">
                                {result.documents.map((doc) => (
                                    <li
                                        key={doc.id}
                                        className="flex justify-between py-2"
                                    >
                                        <span>{doc.title}</span>
                                        <span className="font-mono text-sm text-muted-foreground">
                                            {doc.reference}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <div className="rounded-lg border p-4">
                    <h2 className="font-medium">Search by address</h2>
                    <p className="text-sm text-muted-foreground">
                        Know the building but not the owner? Search by location
                        instead.
                    </p>
                    <form
                        onSubmit={handleLocationSearch}
                        className="mt-2 flex gap-2"
                    >
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Rizal St"
                            className="flex-1 rounded-md border px-3 py-2 text-sm"
                        />
                        <button
                            type="submit"
                            className="rounded-md border px-3 py-2 text-sm font-medium"
                        >
                            Search
                        </button>
                    </form>

                    {locationResults && locationResults.length === 0 && (
                        <p className="mt-2 text-muted-foreground">
                            No known branch matches this address — check the
                            ledger.
                        </p>
                    )}

                    {locationResults && locationResults.length > 0 && (
                        <ul className="mt-2 divide-y">
                            {locationResults.map((branch) => (
                                <li key={branch.id} className="py-2">
                                    <div className="flex justify-between">
                                        <span className="font-medium">
                                            {branch.business.name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {branch.location}
                                        </span>
                                    </div>
                                    {branch.documents.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Nothing encoded yet — go to the room
                                            or storage building.
                                        </p>
                                    ) : (
                                        <ul className="mt-1 divide-y">
                                            {branch.documents.map((doc) => (
                                                <li
                                                    key={doc.id}
                                                    className="flex justify-between py-1"
                                                >
                                                    <span>{doc.title}</span>
                                                    <span className="font-mono text-sm text-muted-foreground">
                                                        {doc.reference}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
