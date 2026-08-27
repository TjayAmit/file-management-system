import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export type PaginatedLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: PaginatedLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

export default function Paginator<T>({
    page,
    noun = 'result',
    plural,
    className,
}: {
    page: Paginated<T>;
    noun?: string;
    plural?: string;
    className?: string;
}) {
    if (page.total === 0) {
        return null;
    }

    const label = page.total === 1 ? noun : (plural ?? `${noun}s`);

    return (
        <div
            className={cn(
                'mt-auto flex flex-col items-center justify-between gap-3.5 border-t border-border/70 bg-muted/25 px-5 py-3.5 sm:flex-row sm:px-6',
                className,
            )}
        >
            <p className="text-xs font-medium text-muted-foreground">
                Showing{' '}
                <span className="font-semibold text-foreground">
                    {page.from ?? 0}
                </span>
                –
                <span className="font-semibold text-foreground">
                    {page.to ?? 0}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-foreground">
                    {page.total}
                </span>{' '}
                {label}
            </p>

            {page.last_page > 1 && (
                <nav
                    className="flex flex-wrap items-center gap-1"
                    aria-label="Pagination"
                >
                    {page.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url}
                                preserveScroll
                                className={cn(
                                    'inline-flex min-w-8 items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
                                    link.active
                                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                        : 'border-border bg-card text-foreground hover:border-border hover:bg-muted/80',
                                )}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ) : (
                            <span
                                key={`${link.label}-${index}`}
                                className="inline-flex min-w-8 items-center justify-center rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground/50 opacity-60"
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ),
                    )}
                </nav>
            )}
        </div>
    );
}
