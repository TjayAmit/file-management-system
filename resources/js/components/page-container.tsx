import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Every page's outer frame, so padding and rhythm are decided once.
 *
 * `width` is about reading comfort, not about leaving room: `wide` still
 * spans the whole viewport on a normal office monitor and only stops
 * stretching past the point where a table row becomes hard to track across.
 * Use `narrow` only for a single-column form, and `full` for a dense grid or
 * a wide table that genuinely wants every pixel.
 */
export type PageWidth = 'narrow' | 'wide' | 'full';

const widthClasses: Record<PageWidth, string> = {
    narrow: 'max-w-4xl',
    wide: 'max-w-[112rem]',
    full: 'max-w-none',
};

export default function PageContainer({
    width = 'wide',
    className,
    children,
}: {
    width?: PageWidth;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'mx-auto flex w-full flex-1 flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8',
                widthClasses[width],
                className,
            )}
        >
            {children}
        </div>
    );
}
