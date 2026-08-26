import type { ReactNode } from 'react';

/**
 * The heading block every archive page opens with — same rhythm as the
 * marketing page's section headers, scaled down for an application view.
 */
export default function PageHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-balance">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
