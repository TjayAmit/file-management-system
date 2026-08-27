import { Head } from '@inertiajs/react';
import { CircleSlash, Info, Search, Target, TrendingUp } from 'lucide-react';
import Callout from '@/components/callout';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import {
    SectionCard,
    SectionCardBody,
    SectionCardHeader,
} from '@/components/section-card';
import StatCard from '@/components/stat-card';
import StatusBadge from '@/components/status-badge';
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
            <Head title="Hit-Rate Analytics" />
            <PageContainer>
                <PageHeader
                    title="Search Hit-Rate Report"
                    icon={TrendingUp}
                    description="A search counts as a hit when the clerk opened one of its results. Below 60%, staff stop trusting the digital repository first and walk to physical storage instead."
                    badge={
                        <StatusBadge
                            tone={meetsTarget ? 'success' : 'warning'}
                            dot
                            pulse={!meetsTarget}
                        >
                            {meetsTarget
                                ? 'Target achieved'
                                : 'Below benchmark'}
                        </StatusBadge>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={Search}
                        tone="primary"
                        label="Total searches"
                        value={report.total}
                        hint="All queries logged across the archive."
                    />
                    <StatCard
                        icon={Target}
                        tone="success"
                        label="Successful hits"
                        value={report.hits}
                        hint="Queries ending in an opened document."
                    />
                    <StatCard
                        icon={CircleSlash}
                        tone="warning"
                        label="Probable misses"
                        value={report.misses}
                        hint="Queries with no subsequent document view."
                    />
                    <StatCard
                        icon={TrendingUp}
                        tone={meetsTarget ? 'success' : 'warning'}
                        label="Hit rate"
                        value={`${report.hit_rate}%`}
                        hint={
                            meetsTarget
                                ? 'At or above the 60% operational target.'
                                : 'Below the 60% operational target.'
                        }
                    />
                </div>

                <SectionCard>
                    <SectionCardHeader
                        title="Benchmark performance"
                        description="Digital retrieval adoption against the 60% threshold."
                        icon={Target}
                        actions={
                            <span className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                    {report.hit_rate}%
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    / 60%
                                </span>
                            </span>
                        }
                    />

                    <SectionCardBody className="space-y-6">
                        <div>
                            <div className="relative h-3.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        meetsTarget
                                            ? 'bg-success'
                                            : 'bg-warning'
                                    }`}
                                    style={{
                                        width: `${Math.min(report.hit_rate, 100)}%`,
                                    }}
                                />
                                <div
                                    aria-hidden
                                    title="60% target benchmark"
                                    className="absolute inset-y-0 w-0.5 bg-foreground"
                                    style={{ left: '60%' }}
                                />
                            </div>

                            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>0% baseline</span>
                                <span className="font-semibold text-foreground">
                                    60% operational target
                                </span>
                                <span>100% full adoption</span>
                            </div>
                        </div>

                        <Callout
                            tone="info"
                            icon={Info}
                            title="Reading this number"
                        >
                            The rate reflects staff habit and index completeness
                            together. When it drops, the fix is usually not the
                            search box — it is encoding the paper that keeps
                            getting fetched by hand.
                        </Callout>
                    </SectionCardBody>
                </SectionCard>
            </PageContainer>
        </>
    );
}

SearchReport.layout = {
    breadcrumbs: [
        { title: 'Search', href: search.index() },
        { title: 'Hit-rate report', href: search.report() },
    ],
};
