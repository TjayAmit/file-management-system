import type { ComponentType, ReactNode, SVGProps } from 'react';

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="size-6" />
            </span>
            <div className="space-y-1">
                <p className="font-medium">{title}</p>
                {description && (
                    <p className="mx-auto max-w-md text-sm text-pretty text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
}
