import { usePage } from '@inertiajs/react';
import LogoMark from '@/components/logo-mark';

export default function AppLogo() {
    const { name } = usePage<{ name: string }>().props;

    return (
        <>
            <LogoMark className="size-8 rounded-md" iconClassName="size-4.5" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold">
                    {name}
                </span>
                <span className="truncate text-xs leading-tight text-sidebar-foreground/60">
                    Paper archive index
                </span>
            </div>
        </>
    );
}
