import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * The one panel shape the app uses.
 *
 * Before this, near-identical cards across nine pages carried five different
 * paddings (`p-5`, `p-6`, `px-6 py-4.5`, `p-4.5`, `p-6 sm:p-7`), so panels
 * sitting side by side in the same grid did not line up. Everything routes
 * through these four pieces now, and the spacing scale lives here alone.
 */
export function SectionCard({
    className,
    tone = 'default',
    children,
    ...props
}: React.ComponentProps<'section'> & {
    tone?: 'default' | 'danger' | 'warning' | 'primary';
}) {
    const toneClasses = {
        default: 'border-border bg-card',
        danger: 'border-destructive/30 bg-destructive/[0.035]',
        warning: 'border-warning/35 bg-warning-muted/40',
        primary: 'border-primary/25 bg-primary/[0.035]',
    } as const;

    return (
        <section
            className={cn(
                'flex min-w-0 flex-col overflow-hidden rounded-2xl border shadow-2xs',
                toneClasses[tone],
                className,
            )}
            {...props}
        >
            {children}
        </section>
    );
}

export function SectionCardHeader({
    title,
    description,
    icon: Icon,
    actions,
    tone = 'default',
    className,
    children,
}: {
    title: ReactNode;
    description?: ReactNode;
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
    actions?: ReactNode;
    tone?: 'default' | 'danger' | 'warning';
    className?: string;
    children?: ReactNode;
}) {
    const chipTone = {
        default: 'border-primary/20 bg-primary/10 text-primary',
        danger: 'border-destructive/25 bg-destructive/10 text-destructive',
        warning:
            'border-warning/35 bg-warning/15 text-warning-foreground dark:text-warning',
    } as const;

    return (
        <header
            className={cn(
                'flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-border/70 bg-muted/25 px-5 py-4 sm:px-6',
                className,
            )}
        >
            <div className="flex min-w-0 items-start gap-3">
                {Icon && (
                    <span
                        className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-xl border',
                            chipTone[tone],
                        )}
                    >
                        <Icon className="size-4.5" />
                    </span>
                )}
                <div className="min-w-0 space-y-0.5">
                    <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
                            {description}
                        </p>
                    )}
                    {children}
                </div>
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </header>
    );
}

export function SectionCardBody({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return <div className={cn('p-5 sm:p-6', className)} {...props} />;
}

export function SectionCardFooter({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-muted/25 px-5 py-4 sm:px-6',
                className,
            )}
            {...props}
        />
    );
}

/**
 * A filter bar pinned under a card header. Same horizontal padding as the
 * header above it so the controls line up with the title.
 */
export function SectionToolbar({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex flex-wrap items-end gap-3 border-b border-border/70 bg-muted/15 px-5 py-4 sm:px-6',
                className,
            )}
            {...props}
        />
    );
}
