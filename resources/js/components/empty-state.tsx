import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'animate-fade flex flex-1 flex-col items-center justify-center gap-3.5 px-6 py-16 text-center',
                className,
            )}
        >
            <div className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
                <Icon className="size-7" />
            </div>
            <div className="space-y-1.5">
                <p className="text-base font-semibold text-foreground">
                    {title}
                </p>
                {description && (
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {action && <div className="mt-1">{action}</div>}
        </div>
    );
}
