import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface DocumentItem {
    id: number;
    reference: string;
    title: string;
}

export default function DocumentIndex({
    documents,
}: {
    documents: DocumentItem[];
}) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Documents', href: '/documents' }]}>
            <Head title="Documents" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">Documents Archive</h1>
                <div className="rounded-lg border p-4">
                    <ul className="divide-y">
                        {documents?.map((doc) => (
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
                </div>
            </div>
        </AppLayout>
    );
}
