import { Link } from '@inertiajs/react';
import { Palette, ShieldCheck, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import PageContainer from '@/components/page-container';
import PageHeader from '@/components/page-header';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile details', href: edit(), icon: User },
    { title: 'Security & access', href: editSecurity(), icon: ShieldCheck },
    { title: 'Theme & appearance', href: editAppearance(), icon: Palette },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <PageContainer>
            <PageHeader
                title="Account Settings"
                icon={User}
                description="Your staff profile, the credentials that protect it, and how the interface looks on this device."
            />

            <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
                <nav
                    aria-label="Settings"
                    className="scroll-slim flex flex-row gap-1.5 overflow-x-auto pb-2 lg:sticky lg:top-22 lg:flex-col lg:pb-0"
                >
                    {sidebarNavItems.map((item, index) => {
                        const active = isCurrentOrParentUrl(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={`${toUrl(item.href)}-${index}`}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors',
                                    'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                                    active
                                        ? 'bg-primary/10 font-semibold text-primary shadow-2xs'
                                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                )}
                            >
                                {Icon && (
                                    <Icon
                                        className={cn(
                                            'size-4 shrink-0',
                                            active
                                                ? 'text-primary'
                                                : 'text-muted-foreground',
                                        )}
                                    />
                                )}
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex min-w-0 flex-col gap-6">{children}</div>
            </div>
        </PageContainer>
    );
}
