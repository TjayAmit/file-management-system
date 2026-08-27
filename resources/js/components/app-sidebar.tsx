import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    Eye,
    FileText,
    History,
    LayoutGrid,
    MapPin,
    Search,
    Tags,
    Trash2,
    TrendingUp,
    Truck,
    Users,
    Warehouse,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import branches from '@/routes/branches';
import businesses from '@/routes/businesses';
import deletionRequests from '@/routes/deletion-requests';
import documents from '@/routes/documents';
import requestTypes from '@/routes/request-types';
import search from '@/routes/search';
import storageLocations from '@/routes/storage-locations';
import transfers from '@/routes/transfers';
import type { NavItem } from '@/types';

const retrievalNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
    { title: 'Search', href: search.index(), icon: Search },
    { title: 'Documents', href: documents.index(), icon: FileText },
    { title: 'Transfers', href: transfers.index(), icon: Truck },
];

const filingNavItems: NavItem[] = [
    { title: 'Businesses', href: businesses.index(), icon: Building2 },
    { title: 'Branches', href: branches.index(), icon: MapPin },
    { title: 'Request types', href: requestTypes.index(), icon: Tags },
    {
        title: 'Storage locations',
        href: storageLocations.index(),
        icon: Warehouse,
    },
];

const editorNavItems: NavItem[] = [
    {
        title: 'Deletion requests',
        href: deletionRequests.index(),
        icon: Trash2,
    },
];

const adminNavItems: NavItem[] = [
    { title: 'Hit-rate report', href: search.report(), icon: TrendingUp },
    { title: 'Users', href: admin.users.index(), icon: Users },
    { title: 'Activity log', href: admin.activities.index(), icon: History },
    { title: 'Access log', href: admin.accessLogs.index(), icon: Eye },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user?.role;
    const canEdit = role === 'editor' || role === 'admin';
    const isAdmin = role === 'admin';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-4">
                <NavMain items={retrievalNavItems} label="Retrieval" />
                <NavMain items={filingNavItems} label="Filing structure" />
                {canEdit && (
                    <NavMain items={editorNavItems} label="Housekeeping" />
                )}
                {isAdmin && (
                    <NavMain items={adminNavItems} label="Administration" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
