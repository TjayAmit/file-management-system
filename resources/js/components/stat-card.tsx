import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * The icon-chip tile used on the marketing page, reused as a metric card.
 */
export default function StatCard({
    icon: Icon,
    label,
    value,
    hint,
    className,
}: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
    value: string | number;
    hint?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                        {value}
                    </p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5" />
                </span>
            </div>
            {hint && (
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {hint}
                </p>
            )}
        </div>
    );
}
