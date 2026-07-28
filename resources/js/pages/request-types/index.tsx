import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface RequestTypeItem {
    id: number;
    name: string;
}

export default function RequestTypeIndex({
    requestTypes,
}: {
    requestTypes: RequestTypeItem[];
}) {
    return (
        <AppLayout
            breadcrumbs={[{ title: 'Request Types', href: '/request-types' }]}
        >
            <Head title="Request Types" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">Request Types</h1>
                <div className="rounded-lg border p-4">
                    <ul className="divide-y">
                        {requestTypes?.map((item) => (
                            <li
                                key={item.id}
                                className="flex justify-between py-2"
                            >
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
