import { Link, usePage } from '@inertiajs/react';
import { Check, ShieldCheck } from 'lucide-react';
import LogoMark from '@/components/logo-mark';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const trustPoints = [
    'Role-based access per team',
    'Private, authenticated storage',
    'Soft-delete trash with restore',
];

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-2">
            <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,--theme(--color-primary-foreground/12%),transparent_60%)]"
                />
                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-2.5"
                >
                    <LogoMark className="bg-primary-foreground text-primary" />
                    <span className="text-sm font-semibold tracking-tight">
                        {name}
                    </span>
                </Link>
                <div className="relative z-10 flex max-w-sm flex-col gap-6">
                    <h2 className="text-3xl font-semibold tracking-tight text-balance">
                        All your department&rsquo;s files. One secure home.
                    </h2>
                    <p className="text-primary-foreground/80">
                        Organize folders, control who can edit, and undo
                        mistakes with trash &amp; restore.
                    </p>
                    <ul className="flex flex-col gap-2.5 text-sm">
                        {trustPoints.map((point) => (
                            <li
                                key={point}
                                className="flex items-center gap-2.5"
                            >
                                <Check className="size-4 shrink-0" />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-sm text-primary-foreground/80">
                    <ShieldCheck className="size-4 shrink-0" />
                    Managed accounts — no self-signup
                </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-8 p-6 md:p-10">
                <Link
                    href={home()}
                    className="flex items-center gap-2.5 lg:hidden"
                >
                    <LogoMark />
                    <span className="text-sm font-semibold tracking-tight">
                        {name}
                    </span>
                </Link>

                <Card className="w-full max-w-sm rounded-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                        {children}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
