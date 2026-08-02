import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface HitRateReport {
    total: number;
    hits: number;
    misses: number;
    hit_rate: number;
}

export default function SearchReport({ report }: { report: HitRateReport }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Search', href: '/search' },
                { title: 'Report', href: '/search/report' },
            ]}
        >
            <Head title="Search hit-rate report" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-xl font-bold">Search hit-rate report</h1>
                <p className="text-muted-foreground">
                    Progress toward the 60% hit-rate target. A search counts as
                    a hit when a result was opened.
                </p>
                <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Total searches
                        </p>
                        <p className="text-2xl font-bold">{report.total}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Hits</p>
                        <p className="text-2xl font-bold">{report.hits}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Probable misses
                        </p>
                        <p className="text-2xl font-bold">{report.misses}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Hit rate
                        </p>
                        <p className="text-2xl font-bold">{report.hit_rate}%</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
