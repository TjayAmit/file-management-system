import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';

export type StatTone = 'primary' | 'success' | 'warning' | 'info' | 'neutral';

const toneStyles: Record<
    StatTone,
    {
        iconBg: string;
        iconText: string;
        glow: string;
    }
> = {
    primary: {
        iconBg: 'bg-primary/10 text-primary border-primary/20',
        iconText: 'text-primary',
        glow: 'hover:border-primary/40',
    },
    success: {
        iconBg: 'bg-success-muted text-success border-success/30',
        iconText: 'text-success',
        glow: 'hover:border-success/40',
    },
    warning: {
        iconBg: 'bg-warning-muted text-warning-foreground dark:text-warning border-warning/35',
        iconText: 'text-warning-foreground dark:text-warning',
        glow: 'hover:border-warning/40',
    },
    info: {
        iconBg: 'bg-info-muted text-info border-info/30',
        iconText: 'text-info',
        glow: 'hover:border-info/40',
    },
    neutral: {
        iconBg: 'bg-muted text-muted-foreground border-border',
        iconText: 'text-muted-foreground',
        glow: 'hover:border-border',
    },
};

/**
 * Modern stat card with refined typography, icon chip, and hover elevation.
 */
export default function StatCard({
    icon: Icon,
    label,
    value,
    hint,
    badge,
    tone = 'primary',
    className,
}: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
    value: string | number;
    hint?: string;
    badge?: ReactNode;
    tone?: StatTone;
    className?: string;
}) {
    const toneConfig = toneStyles[tone] ?? toneStyles.primary;

    return (
        <div
            className={cn(
                'group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0',
                toneConfig.glow,
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        {label}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                            {value}
                        </p>
                        {badge && <div className="shrink-0">{badge}</div>}
                    </div>
                </div>
                <span
                    className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors',
                        toneConfig.iconBg,
                    )}
                >
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
