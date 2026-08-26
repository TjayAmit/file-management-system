import { Head } from '@inertiajs/react';
import { CircleSlash, Search, Target, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import search from '@/routes/search';

type HitRateReport = {
    total: number;
    hits: number;
    misses: number;
    hit_rate: number;
};

export default function SearchReport({ report }: { report: HitRateReport }) {
    const meetsTarget = report.hit_rate >= 60;

    return (
        <>
            <Head title="Search hit-rate report" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Search hit-rate report"
                    description="A search counts as a hit when the clerk opened one of its results. Below 60%, staff stop opening the system first and walk to the storage room instead."
                />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        icon={Search}
                        label="Searches run"
                        value={report.total}
                    />
                    <StatCard
                        icon={Target}
                        label="Hits"
                        value={report.hits}
                        hint="A result was opened."
                    />
                    <StatCard
                        icon={CircleSlash}
                        label="Probable misses"
                        value={report.misses}
                        hint="Nothing was opened — the clerk may also have simply changed their mind."
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Hit rate"
                        value={`${report.hit_rate}%`}
                        hint={
                            meetsTarget
                                ? 'At or above the 60% target.'
                                : 'Below the 60% target.'
                        }
                    />
                </div>

                <section className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-baseline justify-between gap-3">
                        <h2 className="font-semibold">Progress to target</h2>
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {report.hit_rate}% of 60%
                        </span>
                    </div>

                    <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-muted">
                        <div
                            className={
                                meetsTarget
                                    ? 'h-full rounded-full bg-primary'
                                    : 'h-full rounded-full bg-amber-500'
                            }
                            style={{
                                width: `${Math.min(report.hit_rate, 100)}%`,
                            }}
                        />
                        <div
                            aria-hidden
                            className="absolute inset-y-0 w-0.5 bg-foreground/50"
                            style={{ left: '60%' }}
                        />
                    </div>

                    <p className="mt-4 text-sm text-pretty text-muted-foreground">
                        This is a trend, not a verdict. The system cannot tell a
                        clerk who gave up from one who found the file elsewhere
                        — linking every upload back to the search that prompted
                        it was rejected as extra work for an already-rushed
                        employee. Direction over time is what matters.
                    </p>
                </section>
            </div>
        </>
    );
}

SearchReport.layout = {
    breadcrumbs: [
        { title: 'Search', href: search.index() },
        { title: 'Hit-rate report', href: search.report() },
    ],
};
