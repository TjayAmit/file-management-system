import { AlertCircle } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p
            role="alert"
            {...props}
            className={cn(
                'flex items-start gap-1.5 text-sm text-destructive',
                className,
            )}
        >
            <AlertCircle aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>{message}</span>
        </p>
    ) : null;
}
