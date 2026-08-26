import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            {/*
             * Keyboard users land on the sidebar first on every page. This
             * lets them jump straight to the work instead of tabbing past
             * fifteen nav links each time.
             */}
            <a
                href="#main-content"
                className="sr-only-focusable fixed top-3 left-3 z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-lg"
            >
                Skip to content
            </a>

            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div
                    id="main-content"
                    tabIndex={-1}
                    className="flex flex-1 flex-col"
                >
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
