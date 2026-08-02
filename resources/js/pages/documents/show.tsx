import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import documents from '@/routes/documents';

interface DocumentItem {
    id: number;
    reference: string;
    title: string;
}

function fileUrl(reference: string, action: 'view' | 'download' | 'print') {
    return documents.file.url(reference, { query: { action } });
}

export default function DocumentShow({ document }: { document: DocumentItem }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Documents', href: '/documents' },
                {
                    title: document.reference,
                    href: `/documents/${document.reference}`,
                },
            ]}
        >
            <Head title={`Document - ${document.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">{document.title}</h1>
                <p className="font-mono text-sm text-muted-foreground">
                    Reference: {document.reference}
                </p>

                <div className="flex gap-2">
                    <a
                        href={fileUrl(document.reference, 'view')}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        View
                    </a>
                    <a
                        href={fileUrl(document.reference, 'download')}
                        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        Download
                    </a>
                    <a
                        href={fileUrl(document.reference, 'print')}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                    >
                        Print
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}
