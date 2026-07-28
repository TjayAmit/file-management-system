import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface StorageLocationItem {
    id: number;
    name: string;
}

export default function StorageLocationIndex({
    storageLocations,
}: {
    storageLocations: StorageLocationItem[];
}) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Storage Locations', href: '/storage-locations' },
            ]}
        >
            <Head title="Storage Locations" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">
                    Physical Storage Locations
                </h1>
                <div className="rounded-lg border p-4">
                    <ul className="divide-y">
                        {storageLocations?.map((item) => (
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
