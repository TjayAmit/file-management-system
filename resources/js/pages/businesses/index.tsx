import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface BranchItem {
    id: number;
    location: string;
}

interface BusinessItem {
    id: number;
    name: string;
    branches?: BranchItem[];
}

export default function BusinessIndex({
    businesses,
}: {
    businesses: BusinessItem[];
}) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Businesses', href: '/businesses' }]}>
            <Head title="Businesses" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">Business Vocabulary</h1>
                <div className="rounded-lg border p-4">
                    <ul className="divide-y">
                        {businesses?.map((business) => (
                            <li
                                key={business.id}
                                className="flex justify-between py-2"
                            >
                                <span>{business.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {business.branches?.length ?? 0} branches
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
