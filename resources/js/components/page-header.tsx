import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Modern page header with title, description, badge, icon, and action bar.
 */
export default function PageHeader({
    title,
    description,
    eyebrow,
    icon: Icon,
    badge,
    actions,
    className,
}: {
    title: string;
    description?: string;
    eyebrow?: string;
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
    badge?: ReactNode;
    actions?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'animate-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="flex min-w-0 items-start gap-3.5">
                {Icon && (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs sm:size-11">
                        <Icon className="size-5 sm:size-6" />
                    </span>
                )}
                <div className="min-w-0 space-y-1">
                    {eyebrow && (
                        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                            {eyebrow}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl">
                            {title}
                        </h1>
                        {badge && <div className="shrink-0">{badge}</div>}
                    </div>
                    {description && (
                        <p className="max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-start">
                    {actions}
                </div>
            )}
        </div>
    );
}
