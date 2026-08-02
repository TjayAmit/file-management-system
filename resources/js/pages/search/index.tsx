import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface DocumentItem {
    id: number;
    reference: string;
    title: string | null;
}

interface BusinessItem {
    id: number;
    name: string;
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
}

const stateMessages: Record<SearchState, string> = {
    found: 'Documents encoded for this business.',
    known_no_documents:
        'This business is known, but nothing is encoded yet — go to the room or storage building.',
    unknown: 'Not in the known list — check the ledger.',
};

export default function SearchIndex({
    result,
    filters,
}: {
    result: SearchResult | null;
    filters: Filters;
}) {
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
            </div>
        </AppLayout>
    );
}
