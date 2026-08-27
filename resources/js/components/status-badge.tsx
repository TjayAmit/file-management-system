import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatusTone =
    'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'primary';

const toneStyles: Record<
    StatusTone,
    {
        badge: string;
        dot: string;
    }
> = {
    neutral: {
        badge: 'border-border bg-muted/80 text-muted-foreground',
        dot: 'bg-muted-foreground',
    },
    success: {
        badge: 'border-success/30 bg-success-muted text-success',
        dot: 'bg-success',
    },
    warning: {
        badge: 'border-warning/35 bg-warning-muted text-warning-foreground dark:text-warning',
        dot: 'bg-warning-foreground dark:bg-warning',
    },
    info: {
        badge: 'border-info/30 bg-info-muted text-info',
        dot: 'bg-info',
    },
    danger: {
        badge: 'border-destructive/30 bg-destructive-muted text-destructive',
        dot: 'bg-destructive',
    },
    primary: {
        badge: 'border-primary/30 bg-primary/10 text-primary',
        dot: 'bg-primary',
    },
};

/**
 * A small, meaning-carrying pill with optional icon or status dot.
 */
export default function StatusBadge({
    tone = 'neutral',
    icon,
    dot = false,
    pulse = false,
    children,
    className,
}: {
    tone?: StatusTone;
    icon?: ReactNode;
    dot?: boolean;
    pulse?: boolean;
    children: ReactNode;
    className?: string;
}) {
    const config = toneStyles[tone] ?? toneStyles.neutral;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shadow-xs',
                config.badge,
                className,
            )}
        >
            {dot && (
                <span className="relative flex size-1.5 items-center justify-center">
                    {pulse && (
                        <span
                            className={cn(
                                'absolute inline-flex size-full animate-ping rounded-full opacity-75',
                                config.dot,
                            )}
                        />
                    )}
                    <span
                        className={cn(
                            'relative inline-flex size-1.5 rounded-full',
                            config.dot,
                        )}
                    />
                </span>
            )}
            {icon}
            <span>{children}</span>
        </span>
    );
}
