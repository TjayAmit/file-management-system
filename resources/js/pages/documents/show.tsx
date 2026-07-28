import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface DocumentItem {
    id: number;
    reference: string;
    title: string;
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
            </div>
        </AppLayout>
    );
}
