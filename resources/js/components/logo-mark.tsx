import { FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LogoMark({
    className,
    iconClassName,
}: {
    className?: string;
    iconClassName?: string;
}) {
    return (
        <span
            className={cn(
                'flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground',
                className,
            )}
        >
            <FolderTree className={cn('size-4.5', iconClassName)} />
        </span>
    );
}
