import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatusTone =
    'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'primary';

const toneStyles: Record<StatusTone, string> = {
    neutral: 'border-border bg-muted text-muted-foreground',
    success: 'border-success/30 bg-success-muted text-success',
    warning: 'border-warning/35 bg-warning-muted text-warning-foreground',
    info: 'border-info/30 bg-info-muted text-info',
    danger: 'border-destructive/30 bg-destructive-muted text-destructive',
    primary: 'border-primary/30 bg-primary/10 text-primary',
};

/**
 * A small, meaning-carrying pill.
 *
 * The archive's states are the point of the system -- where the paper is,
 * whether a deletion is pending -- so they get colour rather than another
 * shade of grey.
 */
export default function StatusBadge({
    tone = 'neutral',
    icon,
    children,
    className,
}: {
    tone?: StatusTone;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
                toneStyles[tone],
                className,
            )}
        >
            {icon}
            {children}
        </span>
    );
}
