import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface BusinessItem {
    id: number;
    name: string;
}

interface BranchItem {
    id: number;
    location: string;
    business?: BusinessItem;
}

export default function BranchIndex({ branches }: { branches: BranchItem[] }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Branches', href: '/branches' }]}>
            <Head title="Branches" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">Branch Filing Units</h1>
                <div className="rounded-lg border p-4">
                    <ul className="divide-y">
                        {branches?.map((branch) => (
                            <li
                                key={branch.id}
                                className="flex justify-between py-2"
                            >
                                <span>{branch.location}</span>
                                <span className="text-sm text-muted-foreground">
                                    {branch.business?.name ?? 'No Business'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
