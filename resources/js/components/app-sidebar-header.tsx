import { Link, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import search from '@/routes/search';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props;
    const role = auth.user?.role ?? 'viewer';

    const roleTones = {
        admin: 'primary',
        editor: 'info',
        viewer: 'neutral',
    } as const;

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-background/85 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
                <div className="h-4 w-px bg-border/60" aria-hidden />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 border-border/70 bg-card/60 px-2.5 text-xs text-muted-foreground shadow-2xs hover:bg-muted/60 hover:text-foreground"
                >
                    <Link href={search.index()} prefetch>
                        <Search className="size-3.5" />
                        <span className="hidden sm:inline">Find document</span>
                    </Link>
                </Button>

                <StatusBadge
                    tone={
                        roleTones[role as keyof typeof roleTones] ?? 'neutral'
                    }
                    className="hidden text-[11px] capitalize sm:inline-flex"
                >
                    {role}
                </StatusBadge>
            </div>
        </header>
    );
}
