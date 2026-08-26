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
}: {
    page: Paginated<T>;
    noun?: string;
    plural?: string;
}) {
    if (page.total === 0) {
        return null;
    }

    const label = page.total === 1 ? noun : (plural ?? `${noun}s`);

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{page.from ?? 0}</span>–
                <span className="font-medium">{page.to ?? 0}</span> of{' '}
                <span className="font-medium">{page.total}</span> {label}
            </p>

            {page.last_page > 1 && (
                <nav className="flex flex-wrap items-center gap-1">
                    {page.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url}
                                preserveScroll
                                className={cn(
                                    'rounded-md border px-2.5 py-1.5 text-sm transition-colors',
                                    link.active
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border hover:bg-accent',
                                )}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ) : (
                            <span
                                key={`${link.label}-${index}`}
                                className="rounded-md border border-border px-2.5 py-1.5 text-sm text-muted-foreground opacity-50"
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
