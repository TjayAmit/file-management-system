import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';

export type CalloutTone = 'info' | 'warning' | 'danger' | 'success' | 'primary';

const toneStyles: Record<CalloutTone, { panel: string; chip: string }> = {
    info: {
        panel: 'border-info/30 bg-info-muted/50',
        chip: 'bg-info/15 text-info',
    },
    warning: {
        panel: 'border-warning/40 bg-warning-muted/60',
        chip: 'bg-warning/20 text-warning-foreground dark:text-warning',
    },
    danger: {
        panel: 'border-destructive/35 bg-destructive-muted/60',
        chip: 'bg-destructive/15 text-destructive',
    },
    success: {
        panel: 'border-success/30 bg-success-muted/50',
        chip: 'bg-success/15 text-success',
    },
    primary: {
        panel: 'border-primary/25 bg-primary/[0.06]',
        chip: 'bg-primary/12 text-primary',
    },
};

/**
 * A standing note about the state of the page -- a document held back from
 * search, a queue waiting on an administrator, a rule worth reading once
 * before filling in a form.
 *
 * Deliberately not the channel for "saved successfully": that is transient,
 * belongs in a toast, and does not deserve a permanent row at the top of the
 * page. A callout is for something that is still true after you look away.
 */
export default function Callout({
    icon: Icon,
    title,
    tone = 'info',
    actions,
    className,
    children,
}: {
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
    title?: ReactNode;
    tone?: CalloutTone;
    actions?: ReactNode;
    className?: string;
    children?: ReactNode;
}) {
    const styles = toneStyles[tone];

    return (
        <div
            className={cn(
                'animate-rise flex flex-wrap items-start justify-between gap-x-4 gap-y-3 rounded-2xl border px-5 py-4 shadow-2xs',
                styles.panel,
                className,
            )}
        >
            <div className="flex min-w-0 flex-1 items-start gap-3.5">
                {Icon && (
                    <span
                        className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-xl',
                            styles.chip,
                        )}
                    >
                        <Icon className="size-4.5" />
                    </span>
                )}
                <div className="min-w-0 space-y-1">
                    {title && (
                        <p className="text-sm font-semibold text-foreground">
                            {title}
                        </p>
                    )}
                    {children && (
                        <div className="text-xs leading-relaxed text-pretty text-muted-foreground">
                            {children}
                        </div>
                    )}
                </div>
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
